import 'source-map-support/register'; // エラー時、tsファイルの行数を教える
import {createServer}  from 'http';
import * as express from 'express';
import * as exphbs from 'express-handlebars';
import {MainController} from "./controller/MainController";
import dateFormat = require('dateformat');
import {MongoClient, Db} from 'mongodb';

class Application {
	public static init() {
		this.connectDatabase().then(() => {
			this.initWebApp();
		});
	}

	private static initWebApp() {
		const server = createServer();
		const app = express();

		app.engine('.hbs', exphbs({
			defaultLayout: "layout",
			extname: ".hbs",
			layoutsDir: `${__dirname}/templates`,
			helpers: {
				myDateFormat: (date: Date) => dateFormat(date, "yyyy/mm/dd HH:MM")
			}
		}));
		app.set('views', `${__dirname}/templates`);
		app.set('view engine', '.hbs');
		new MainController(app).init();
		app.use(express.static(__dirname + '/public'));
		server.on('request', app);
		server.listen(process.env.PORT || 3000, () => console.log(`server on port ${server.address().port}`));
	}

	private static connectDatabase() {
		return new Promise(resolve => {
			MongoClient.connect(process.env.MONGODB_URI , (err, db) => {
				if (err) throw err;
				console.log(`success connect Mongodb ${db.databaseName}`);
				resolve(db);
			});
		});
	}
}

Application.init();