-- OSRS Hub TEST database only.
-- Reproducible seed for canonical untradeable equipment examples.
-- Apply to osrshubtest-db (not the production database).

BEGIN TRANSACTION;

INSERT INTO osrs_items
  (item_id,name,examine,members,tradeable,icon,value,high_alch,ge_limit,stackable,noted,linked_id,data_json,updated_at)
VALUES
  (7462,'Barrows gloves','A pair of very nice gloves.',1,0,
   'https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/cdn/equipment/Barrows%20gloves.png',
   100000,60000,0,0,0,NULL,
   '{"id":7462,"name":"Barrows gloves","examine":"A pair of very nice gloves.","members":true,"tradeable":false,"icon":"https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/cdn/equipment/Barrows%20gloves.png","value":100000,"high_alch":60000,"ge_limit":0,"stackable":false,"equipment_slot":"hands","equipment":{"slot":"hands","requirements":{},"bonuses":{"str":12,"ranged_str":0,"magic_str":0,"prayer":0},"offensive":{"stab":12,"slash":12,"crush":12,"magic":6,"ranged":12},"defensive":{"stab":12,"slash":12,"crush":12,"magic":6,"ranged":12}},"requirements":{},"quest_requirements":["Recipe for Disaster"],"shop_price":130000,"source":"Old School RuneScape Wiki","source_url":"https://oldschool.runescape.wiki/w/Barrows_gloves","image_source":"osrshub-combat-engine/cdn/equipment","image_verified":true}',
   unixepoch()*1000),
  (10588,'Salve amulet (e)','Increases the wearer''s Strength and accuracy by 20% when fighting the undead.',1,0,
   'https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/cdn/equipment/Salve%20amulet%20(e).png',
   300,180,0,0,0,NULL,
   '{"id":10588,"name":"Salve amulet (e)","examine":"Increases the wearer''s Strength and accuracy by 20% when fighting the undead.","members":true,"tradeable":false,"icon":"https://raw.githubusercontent.com/lewisxatk/osrshub-combat-engine/main/cdn/equipment/Salve%20amulet%20(e).png","value":300,"high_alch":180,"ge_limit":0,"stackable":false,"equipment_slot":"neck","equipment":{"slot":"neck","requirements":{},"bonuses":{"str":0,"ranged_str":0,"magic_str":0,"prayer":3},"offensive":{"stab":0,"slash":0,"crush":0,"magic":0,"ranged":0},"defensive":{"stab":3,"slash":3,"crush":3,"magic":0,"ranged":0}},"requirements":{},"quest_requirements":[],"shop_price":null,"unlock_requirements_note":"Enchanted by using the Diary of Tarn Razorlor on a Salve amulet after completing the Lair of Tarn Razorlor miniquest. The RuneLite/HiScores account importer does not currently verify this miniquest or item ownership.","source":"Old School RuneScape Wiki","source_url":"https://oldschool.runescape.wiki/w/Salve_amulet_%28e%29","image_source":"osrshub-combat-engine/cdn/equipment","image_verified":true}',
   unixepoch()*1000)
ON CONFLICT(item_id) DO UPDATE SET
  name=excluded.name, examine=excluded.examine, members=excluded.members,
  tradeable=excluded.tradeable, icon=excluded.icon, value=excluded.value,
  high_alch=excluded.high_alch, ge_limit=excluded.ge_limit,
  stackable=excluded.stackable, data_json=excluded.data_json,
  updated_at=excluded.updated_at;

INSERT INTO osrs_item_data(item_id,name,data_json,updated_at)
SELECT item_id,name,data_json,updated_at
FROM osrs_items WHERE item_id IN (7462,10588)
ON CONFLICT(item_id) DO UPDATE SET
  name=excluded.name,data_json=excluded.data_json,updated_at=excluded.updated_at;

INSERT INTO osrs_catalog(entity_type,entity_id,name,members,searchable,data_json,updated_at)
SELECT 'items',item_id,name,members,1,data_json,updated_at
FROM osrs_items WHERE item_id IN (7462,10588)
ON CONFLICT(entity_type,entity_id) DO UPDATE SET
  name=excluded.name,members=excluded.members,searchable=1,
  data_json=excluded.data_json,updated_at=excluded.updated_at;

INSERT INTO osrs_equipment_catalog
  (item_id,slot,equipable,weapon,two_handed,attack_speed,requirements_json,bonuses_json,updated_at)
VALUES
  (7462,'hands',1,0,0,0,'{}',
   '{"slot":"hands","requirements":{},"bonuses":{"str":12,"ranged_str":0,"magic_str":0,"prayer":0},"offensive":{"stab":12,"slash":12,"crush":12,"magic":6,"ranged":12},"defensive":{"stab":12,"slash":12,"crush":12,"magic":6,"ranged":12}}',
   unixepoch()*1000),
  (10588,'neck',1,0,0,0,'{}',
   '{"slot":"neck","requirements":{},"bonuses":{"str":0,"ranged_str":0,"magic_str":0,"prayer":3},"offensive":{"stab":0,"slash":0,"crush":0,"magic":0,"ranged":0},"defensive":{"stab":3,"slash":3,"crush":3,"magic":0,"ranged":0}}',
   unixepoch()*1000)
ON CONFLICT(item_id) DO UPDATE SET
  slot=excluded.slot,equipable=1,weapon=0,two_handed=0,attack_speed=0,
  requirements_json=excluded.requirements_json,bonuses_json=excluded.bonuses_json,
  updated_at=excluded.updated_at;

COMMIT;
