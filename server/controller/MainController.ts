import {Express, Request, Response,} from 'express';
import {CONF_VAR} from "../share/Interfaces";
import * as uuid from "node-uuid";
export class MainController {
	constructor(private app: Express ) {};
	public init() {
		this.app.use((req, res, next) => this.addPersonCookie(req, res, next));
		this.app.get('/', (req, res) => this.top(req, res));
	}

	private addPersonCookie(req: Request, res: Response, next: (err?: any) => void) {
		if (typeof req.cookies[CONF_VAR.COOKIE_PID] === "undefined") {
			res.cookie(CONF_VAR.COOKIE_PID, uuid.v4(), {expires: new Date(2038, 0, 0, 0, 0, 0, 0), httpOnly: true});
		}
		next();
	}

	/** トップページ */
	private top(req: Request, res: Response) {
		res.render("top", {title: "Qucoke.com", hideHeader: true});
	}
}