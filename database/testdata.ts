import {MongoClient, Db} from 'mongodb';

MongoClient.connect("mongodb://localhost:27017/qucoke" , (err, db) => {
	if (err) throw err;
	console.log(`success connect Mongodb ${db.databaseName}`);
	const topics = db.collection("topics");
	const array:any[] = []
	for (var i = 0; i < 50; i++) {
		const topic: any = {
			"postDate" : new Date(),
			"editDate" : new Date(),
			"title" : `タイトル+ ${i}`,
			"commentCount" : 0,
			"viewCount" : 0,
			"tags" : ["hoge"],
			"bodyMd" : "",
			"bodyHtml" : "<h2 id=\"editor-\">editorの操作方法</h2>",
			"userId" : "d6dd643f-9e8d-4b86-a95f-9ac26b8068f9",
			"comments" : [],
			"favoriteCount" : 0
		}
		array.push(topic);
	}
	topics.insertMany(array);
});