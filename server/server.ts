import 'source-map-support/register'; // エラー時、tsファイルの行数を教える
import {createServer}  from 'http';
import * as express from 'express';
import {Express, Request, Response} from 'express';

import * as exphbs from 'express-handlebars';
import {MainController} from "./controller/MainController";
import {TopicController} from "./controller/TopicController";

import {TopicRepository} from "./repository/TopicRepository";
import dateFormat = require('dateformat');
import {MongoClient, Db} from 'mongodb';
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as compression from "compression";

class Application {
	private static db: Db;
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
		app.use(cookieParser());
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());
		app.use(compression({
			threshold: 0,
			level: 9,
			memLevel: 9
		}));
		const topicRepository = new TopicRepository(this.db.collection("topics"));
		new MainController(app).init();
		new TopicController(app, topicRepository).init();
		app.use(express.static(__dirname + '/public'));
		app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
			res.status(500);
			res.send({
				message: err.message
			});
		});
		server.on('request', app);
		server.listen(process.env.PORT || 3000, () => console.log(`server on port ${server.address().port}`));

		process.on('unhandledRejection', (reason: Error) => {
			console.log("Unhandled Rejection:", reason.stack);
			process.exit(1);
		});
		process.on('rejectionHandled', function(p: any) {
			console.error("rejectionHandled reason: " + p.reason());
			process.exit(1);
		});
	}

	private static connectDatabase() {
		return new Promise<Db>(resolve => {
			MongoClient.connect(process.env.MONGODB_URI , (err, db) => {
				if (err) throw err;
				console.log(`success connect Mongodb ${db.databaseName}`);
				this.db = db;
				resolve();
			});
		});
	}
}

Application.init();