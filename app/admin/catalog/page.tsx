import { getCatalogExercises, getCatalogFlashcards } from '@/lib/db'

export default async function CatalogPage() {
  const [exercises, flashcards] = await Promise.all([
    getCatalogExercises(),
    getCatalogFlashcards(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Catalogue partagé</h1>

      {/* Exercices */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Exercices ({exercises.length})</h2>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun exercice dans le catalogue.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Domaine</th>
                  <th className="px-3 py-2 text-left font-medium">Niveau</th>
                  <th className="px-3 py-2 text-left font-medium">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Thème</th>
                  <th className="px-3 py-2 text-left font-medium">Titre / Question</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {exercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-muted/50">
                    <td className="px-3 py-2 text-muted-foreground">{ex.id}</td>
                    <td className="px-3 py-2">{ex.domain}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          ex.level === 'A'
                            ? 'text-green-600 font-semibold'
                            : ex.level === 'B'
                            ? 'text-yellow-600 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {ex.level}
                      </span>
                    </td>
                    <td className="px-3 py-2">{ex.type}</td>
                    <td className="px-3 py-2">{ex.theme}</td>
                    <td className="px-3 py-2 max-w-xs truncate">
                      {ex.title ?? ex.question}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Flashcards */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Flashcards ({flashcards.length})</h2>
        {flashcards.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune flashcard dans le catalogue.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Domaine</th>
                  <th className="px-3 py-2 text-left font-medium">Niveau</th>
                  <th className="px-3 py-2 text-left font-medium">Source</th>
                  <th className="px-3 py-2 text-left font-medium">Recto</th>
                  <th className="px-3 py-2 text-left font-medium">Verso</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {flashcards.map((fc) => (
                  <tr key={fc.id} className="hover:bg-muted/50">
                    <td className="px-3 py-2 text-muted-foreground">{fc.id}</td>
                    <td className="px-3 py-2">{fc.domain}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          fc.level === 'A'
                            ? 'text-green-600 font-semibold'
                            : fc.level === 'B'
                            ? 'text-yellow-600 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {fc.level}
                      </span>
                    </td>
                    <td className="px-3 py-2">{fc.source}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{fc.front}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{fc.back}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
