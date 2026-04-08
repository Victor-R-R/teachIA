# Spec : Persistance des conversations — teachIA

**Date** : 2026-04-08
**Statut** : Approuvé
**Scope** : Feature `/conversations` + persistance du chat

---

## Problème

La page `/chat` réinitialise son état à chaque navigation. Les conversations sont perdues dès que l'utilisateur quitte la page. Il n'existe aucun moyen de retrouver un échange passé.

## Objectif

- Persister chaque conversation en DB automatiquement, de manière transparente
- Permettre de reprendre une conversation interrompue via l'URL
- Offrir une page `/conversations` listant toutes les conversations avec titre IA, date, et bouton de suppression
- Cliquer sur une conversation ramène dans `/chat?id=xxx` avec l'historique chargé

---

## Architecture

### Approche retenue : persistance message par message

Chaque message est sauvegardé en DB dès qu'il est envoyé ou reçu. Un `conversation_id` (nanoid) est généré côté client au premier message et reflété dans l'URL. Le titre est généré par l'IA après le 3e échange (appel `generateText` non-bloquant).

**Pourquoi cette approche :**
- Aucune perte de données même en cas de crash ou coupure réseau
- S'intègre proprement avec le pattern Neon + raw SQL existant
- L'URL `/chat?id=xxx` est shareable et bookmarkable

---

## Modèle de données

Deux nouvelles tables à ajouter à `scripts/migrate.sql` :

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT,                          -- NULL jusqu'à la génération IA
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_messages_conv_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
```

Pas de `user_id` — cohérent avec l'auth existante (JWT mono-utilisateur, `authorized: true`).

---

## Routes API

### Existant étendu : `POST /api/chat`

Reçoit en plus `conversationId` (string) dans le body.

Flux :
1. Si la conversation n'existe pas encore en DB, l'insérer (`INSERT INTO conversations`)
2. Sauvegarder le message utilisateur (`INSERT INTO conversation_messages`)
3. Streamer la réponse AI comme avant
4. Après le stream, sauvegarder la réponse assistant en DB (via `after()` de Next.js)
5. Si c'est le 3e échange et `title IS NULL`, lancer `generateText` pour générer le titre (non-bloquant, via `after()`)

### Nouvelles routes

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/conversations` | Liste toutes les conversations (id, title, created_at, updated_at, message_count) |
| `GET` | `/api/conversations/[id]` | Messages d'une conversation (pour recharger le chat) |
| `DELETE` | `/api/conversations/[id]` | Supprime la conversation (CASCADE sur les messages) |

---

## Changements côté client

### `ChatInterface` (`components/chat/chat-interface.tsx`)

**Au montage :**
- Lire `?id` dans les searchParams
- Si absent → générer `nanoid()`, faire `router.replace('/chat?id=xxx')`
- Si présent → fetch `/api/conversations/[id]` → passer les messages comme `initialMessages` à `useChat`

**À chaque envoi :**
- Passer `conversationId` dans le body du transport : `DefaultChatTransport({ api: '/api/chat', body: { conversationId } })`

**Message INIT :**
- Le message `[[INIT]]` ne doit pas être sauvegardé en DB (filtré côté API)

### Page `/chat` (`app/(dashboard)/chat/page.tsx`)

Passer les `searchParams` au composant pour permettre la lecture du `?id`.

---

## Page `/conversations`

**Route :** `app/(dashboard)/conversations/page.tsx`

**Layout :**
- Liste de cards triées par `updated_at DESC`
- Chaque card : titre IA (ou "Conversation du [date]" si titre non généré), date formatée, nombre de messages
- Bouton supprimer avec `AlertDialog` de confirmation (shadcn/ui)
- Clic sur la card → `router.push('/chat?id=xxx')`
- État vide : message "Aucune conversation enregistrée. Commence à chatter !"

**Navigation :**
- Ajouter le lien `/conversations` dans le sidebar du dashboard (à côté de `/chat`)

---

## Fonctions DB (`lib/db.ts`)

Nouvelles fonctions à ajouter :

```typescript
createConversation(id: string): Promise<void>
saveMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<void>
updateConversationTitle(id: string, title: string): Promise<void>
getConversations(): Promise<ConversationSummary[]>
getConversationMessages(id: string): Promise<ConversationMessage[]>
deleteConversation(id: string): Promise<void>
getMessageCount(id: string): Promise<number>
```

---

## Gestion des erreurs

- Échec de sauvegarde en DB → loggé en console, le chat continue (ne pas bloquer l'utilisateur)
- Conversation introuvable (`?id=xxx` inexistant) → rediriger vers `/chat` sans `?id` (nouvelle convo)
- Échec de génération du titre → la conversation reste sans titre, affichage de la date en fallback
- Suppression en cours → désactiver le bouton, spinner, toast de confirmation

---

## Ce qui est hors scope

- Recherche dans les conversations
- Export des conversations
- Partage entre utilisateurs
- Pagination de la liste (pas nécessaire pour un usage mono-utilisateur)
