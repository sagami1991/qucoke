import 'source-map-support/register'; // エラー時、tsファイルの行数を教える
import {createServer}  from 'http';
import * as express from 'express';
import * as exphbs from 'express-handlebars';
import {MainController} from "./controller/MainController";
import dateFormat = require('dateformat');

class Application {
	public static init() {
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
		server.listen(process.env.PORT || 3000, () => console.log('server on port %s', server.address().port));
	}
}

Application.init();