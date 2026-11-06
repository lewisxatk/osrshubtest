# Combat untradeable item seed (TEST ONLY)

This seed keeps two common untradeable equipment examples searchable and renderable in the isolated OSRS Hub test D1 database:

- Barrows gloves (item 7462): hands slot, Recipe for Disaster gate, 130,000 GP shop acquisition reference.
- Salve amulet (e) (item 10588): neck slot, no GE/shop price, explicit Tarn Razorlor unlock note.

Both records reference their exact OSRS Hub Combat Engine CDN equipment image. They are inserted into `osrs_items`, `osrs_item_data`, `osrs_catalog`, and `osrs_equipment_catalog`.

Apply `combat-untradeable-items.sql` to the **osrshubtest-db** database only. The current test records were also seeded directly and verified. Do not run this file against production without separately reviewing and approving the migration.
