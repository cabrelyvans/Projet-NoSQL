// MERGE plutôt que CREATE pour pouvoir relancer le seed sans dupliquer les nœuds

MERGE (paris:City {code: 'PAR'}) ON CREATE SET paris.weight = 100;
MERGE (london:City {code: 'LON'}) ON CREATE SET london.weight = 90;
MERGE (brussels:City {code: 'BRU'}) ON CREATE SET brussels.weight = 85;
MERGE (amsterdam:City {code: 'AMS'}) ON CREATE SET amsterdam.weight = 80;

MATCH (paris:City {code: 'PAR'}), (london:City {code: 'LON'})
MERGE (paris)-[:NEAR]->(london);

MATCH (paris:City {code: 'PAR'}), (brussels:City {code: 'BRU'})
MERGE (paris)-[:NEAR]->(brussels);

MATCH (paris:City {code: 'PAR'}), (amsterdam:City {code: 'AMS'})
MERGE (paris)-[:NEAR]->(amsterdam);
