import {Express, Request, Response,} from 'express';
import {TopicController} from "./TopicController";
import {CONF_VAR} from "../share/Interfaces";
import * as uuid from "node-uuid";
export class MainController {
    private topicController: TopicController;
	constructor(private app: Express ) {
        this.topicController = new TopicController(app);
		this.topicController.init();
    };
	public init() {
		this.app.all('/**', (req, res, next) => this.addPersonCookie(req, res, next));
		this.app.get('/', (req, res) => this.top(req, res));
		this.app.get('/topics', (req, res) => this.topics(req, res));
		this.app.get('/my-topics', (req, res) => this.myTopics(req, res));
		this.app.get('/topic-edit/:id', (req, res) => this.editTopic(req, res));
		this.app.get('/topic-edit/', (req, res) => this.editTopic(req, res));
	}

	private addPersonCookie(req: Request, res: Response, next: (err?: any) => void) {
		if (typeof req.cookies[CONF_VAR.COOKIE_PID] === "undefined") {
			res.cookie(CONF_VAR.COOKIE_PID, uuid.v4());
		}
		next();
	}

	/** トップページ */
	private top(req: Request, res: Response) {
		res.render("top", {title: "Qucoke.com", hideHeader: true});
	}

	/** 記事一覧 */
	private topics(req: Request, res: Response) {
		res.render("topics", {title: "記事一覧"});
	}

	/** 自分の投稿した記事一覧 */
	private myTopics(req: Request, res: Response) {
		res.render("topics", {title: "投稿した記事一覧"});
	}

	/** 投稿ページ */
	private editTopic(req: Request, res: Response) {
		const topicId = req.params["topic-id"];
		res.render("topic-edit", {
			title: topicId ? "記事を編集" : "記事を作成",
			hidePostTopicButton: true,
			topicId: topicId
		});
	}
}