import {Express, Request, Response} from 'express';
import {Collection, Cursor} from 'mongodb';
import {CONF_VAR,
	TopicInfo,
	TopicEditForm,
	ValidateRule,
	Comment
} from "../share/Interfaces";

import {MyUtil, getMarked} from "../share/serverUtil";
import * as marked from "marked";
import {TopicRepository} from "../repository/TopicRepository";

/** 記事ページや、記事のAPIを管理するコントローラー */
export class TopicController {
	constructor(private app: Express,
				private topicRepository: TopicRepository) {}
	public init() {
		this.app.get('/topic/:id', (req, res) => this.viewTopicPage(req, res));
		this.app.get('/api/topic/:id', (req, res) => this.getTopic(req, res));
		this.app.get("/api/topics", (req, res) => this.getTopics(req, res));
		this.app.put('/api/topic/:id', (req, res) => this.updateTopic(req, res));
		this.app.post("/api/topic/:id/comment/", (req, res) => this.addComment(req, res));
		this.app.post("/api/topic", (req, res) => this.addTopic(req, res));
	}

	/** 記事を一件返す */
	private getTopic(req: Request, res: Response) {
		this.topicRepository.findOne(req.params["id"]).then((topic) => {
			if (!topic) {
				MyUtil.sendError(res, "存在しない記事です。");
				return;
			}
			res.send(topic);
		});
	}

	/** 記事一覧を渡す */
	private getTopics(req: Request, res: Response) {
		let promise: Cursor;
		if (req.query["myself"]) {
			const searchObj = {
				userId: req.cookies[CONF_VAR.COOKIE_PID]
			};
			promise = this.topicRepository.findAllForList(30, searchObj);
		} else {
			promise = this.topicRepository.findAllForList(30);
		}
		promise.toArray((err, arr) => {
		if (err) {
			MyUtil.sendError(res, err.message);
			return;
		}
		res.send(arr.sort((bef, af ) => af.postDate - bef.postDate));
		});
	}

	/** 記事ページを返す */
	private viewTopicPage(req: Request, res: Response) {
		this.topicRepository.findOne(req.params["id"]).then((topic) => {
			if (!topic) {
				MyUtil.sendError(res, "存在しない記事です。");
				return;
			}
			if (!req.cookies[CONF_VAR.COOKIE_ACCESSED]) {
				const date = new Date();
				date.setDate(date.getDay() + 1);
				res.cookie(CONF_VAR.COOKIE_ACCESSED, "1", {expires: date, path: req.path});
				this.topicRepository.addViewCount(req.params["id"]);
			}
			res.render("topic", {
				title: `${topic.title} - Qucoke`,
				topic: topic,
				isMyTopic: topic.userId === req.cookies[CONF_VAR.COOKIE_PID]
			});
		});
	}

	/** 記事を新規投稿 */
	private addTopic(req: Request, res: Response) {
		const reqBody = <TopicEditForm> req.body;
		MyUtil.validate(this.validateTopicEditForm(reqBody));
		const userId = req.cookies[CONF_VAR.COOKIE_PID];
		const topic: TopicInfo = {
			postDate: new Date(),
			editDate: new Date(),
			title: reqBody.title,
			commentCount: 0,
			viewCount: 0,
			tags: reqBody.tags.filter((x, i, self) => self.indexOf(x) === i && x !== "" && x !== " "),
			bodyMd: reqBody.bodyMd,
			bodyHtml: getMarked()(reqBody.bodyMd),
			userId: userId,
			comments: [],
			favoriteCount: 0,
		};

		this.topicRepository.checkRecentPost(userId).toArray((err, arr) => {
			if (err) {
				MyUtil.sendError(res, err.message);
				return;
			}
			if (arr.length === 1) {
				MyUtil.sendError(res, "1分以内に投稿した記事があります。しばらく待ってから投稿してください。");
				return;
			}
			this.topicRepository.addOne(topic).then((result) => {
				res.send({
					id: result.insertedId
				});
			});
		});

	}

	/** 記事を更新する */
	private updateTopic(req: Request, res: Response) {
		const reqTopic = <TopicEditForm> req.body;
		MyUtil.validate(this.validateTopicEditForm(reqTopic));
		reqTopic._id = req.params["id"];
		reqTopic.userId = req.cookies[CONF_VAR.COOKIE_PID];
		reqTopic.bodyHtml = getMarked()(reqTopic.bodyMd),
		this.topicRepository.updateOne(reqTopic).then((result) => {
			if (result.matchedCount === 0) {
				MyUtil.sendError(res);
				return;
			}
			res.send({
				id: reqTopic._id
			});
		});
	}

	/** 記事のバリデーション */
	private validateTopicEditForm(reqBody: TopicEditForm): ValidateRule[] {
		return [
			{ rule: typeof reqBody.title === "string"},
			{ rule: reqBody.title.length > 0, msg: "タイトルが未入力です"},
			{ rule: reqBody.title.length < 60, msg: "タイトルは60文字以内で入力してください"},
			{ rule: reqBody.tags instanceof Array},
			{ rule: reqBody.tags.length < 5, msg: "タグは4個以内に設定してください"},
			{ rule: typeof reqBody.bodyMd === "string"},
			{ rule: reqBody.bodyMd.length < 300000, msg: "記事の内容が300KBを超えています"}
		];
	}

	/** コメントの追加 */
	private addComment(req: Request, res: Response) {
		const reqBody = <Comment> req.body;
		const topicId: string = req.params["id"];
		MyUtil.validate(this.validateComment(reqBody));
		const comment: Comment = {
			postDate: new Date(),
			body: reqBody.body
		};
		this.topicRepository.addComment(topicId, comment).then(() => {
			res.send({});
		});

	}

	/** コメントのバリデーション */
	private validateComment(reqBody: Comment): ValidateRule[] {
		return [
			{ rule: typeof reqBody.body === "string"},
			{ rule: reqBody.body.length > 0, msg: "コメントが未入力です"},
			{ rule: reqBody.body.length < 1000, msg: "コメントは1000文字以内で入力してください"},
		];
	}
}