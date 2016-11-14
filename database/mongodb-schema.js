
/** TopicCollection */
db.createCollection("topics")
db.topics.createIndex({tags: 1})