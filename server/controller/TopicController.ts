import {Express, Request, Response} from 'express';
import {CONF_VAR,
	TopicInfo,
	TopicEditForm,
	ValidateRules
} from "../share/Interfaces";

export class TopicController {
	constructor(private app: Express ) {}
	public init() {
		this.app.get('/topic/:id', (req, res) => this.getTopic(req, res));
        this.app.get("/api/topics", (req, res) => this.getTopics(req, res));
        this.app.post("/api/topic/comment", (req, res) => this.addComment(req, res));
        this.app.post("/api/topic", (req, res) => this.addTopic(req, res));
	}

    /** 記事一覧を渡す */
    private getTopics(req: Request, res: Response) {
        const topics: TopicInfo[] = [];
		for (let i = 0; i < 40; i++) {
			topics.push({
				id: "" + i,
				postDate: new Date(),
				title: "今日は何の日きになるきになるきになるきになるきになる",
				tags: ["自作PC", "競馬", "風俗"],
				commentCount: 5,
				viewCount: 1002,
				comments: [],
				bodyMd: "",
				bodyHtml: undefined
			});
		}
		res.send(topics);
    }

	private getTopic(req: Request, res: Response) {
		const topic: TopicInfo = {
				id: "",
				postDate: new Date(),
				title: "今日は何の日きになるきになるきになるきになるきになる",
				tags: ["自作PC", "競馬", "風俗"],
				commentCount: 5,
				viewCount: 1002,
				comments: [{
					postDate: new Date(),
					body: "とてもそう思う。でも違うと思う。\nああああ明日の天気は雨"
				}],
				bodyMd: "",
				bodyHtml: undefined
			};
		res.render("topic", {title: topic.title, topic: topic});
	}

	/** 記事を新規投稿 */
	private addTopic(req: Request, res: Response) {
		const reqBody = <TopicEditForm> req.body;
		console.log(reqBody);
		this.validateTopicEditForm(reqBody);


	}

	private validateTopicEditForm(reqBody: TopicEditForm) {
		const validateRules: ValidateRules[] = [
			{ rule: typeof reqBody.title === "string"},
			{ rule: reqBody.title.length > 0, msg: "タイトルが未入力です"},
			{ rule: reqBody.title.length < 40, msg: "タイトルは40文字以内で入力してください"},
			{ rule: reqBody.tags instanceof Array},
			{ rule: reqBody.tags.length < 5, msg: "タグは4個以内に設定してください"},
			{ rule: typeof reqBody.bodyMd === "string"},
			{ rule: reqBody.bodyMd.length > 300000, msg: "記事の内容が300KBを超えています"}
		];

		for ( let {rule, msg} of validateRules) {
			console.log(rule);
			if (!rule) {
				const errMsg = msg ? msg : CONF_VAR.ERR_MSG.unexpected_error;
				throw new Error(errMsg);
			}
		}

	}

	private addComment(req: Request, res: Response) {
		console.log(req.params["topic-id"]);
	}
}