# Migraties

Plaats SQL-migraties hier als `.sql`-bestanden. Ze worden door
`src/core/db/db.ts` in bestandsnaamvolgorde toegepast en bijgehouden in de
tabel `_migrations`.

Naamconventie: `001_initial.sql`, `002_something.sql`, enz.

> **Dit is een skelet.** In deze fase zijn er nog geen migraties; alleen de
> runner en deze map staan klaar voor toekomstige database-schema's.
