import {Express, Request, Response} from 'express';
import {TopicController} from "./TopicController";
export class MainController {
    private topicController: TopicController;
	constructor(private app: Express ) {
        this.topicController = new TopicController(app);
		this.topicController.init();
    };
	public init() {
		this.app.get('/', (req, res) => this.top(req, res));
		this.app.get('/topics', (req, res) => this.topics(req, res));
		this.app.get('/my-topics', (req, res) => this.myTopics(req, res));
		this.app.get('/topic-edit', (req, res) => this.editTopic(req, res));
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
		res.render("topic-edit");
	}
}