import {Express, Request, Response} from 'express';
import {Cursor} from 'mongodb';
import {CONF_VAR,
	TopicInfo,
	TopicEditForm,
	ValidateRule,
	Comment
} from "../share/Interfaces";

import {MyUtil, getMarked} from "../share/serverUtil";
import * as marked from "marked";
import {TopicRepository} from "../repository/TopicRepository";

/** 記事のAPIを管理するコントローラー */
export class TopicApiController {
	constructor(private app: Express,
				private topicRepository: TopicRepository) {}
	public init() {
		this.app.get('/api/topic/:id', (req, res) => this.getTopic(req, res));
		this.app.get("/api/topics", (req, res) => this.getTopics(req, res));
		this.app.put('/api/topic/:id', (req, res) => this.updateTopic(req, res));
		this.app.post("/api/topic/:id/comment/", (req, res) => this.addComment(req, res));
		this.app.post("/api/topic", (req, res) => this.addTopic(req, res));
		this.app.delete('/api/topic/:id', (req, res) => this.deleteTopic(req, res));
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

	private deleteTopic(req: Request, res: Response) {
		const id = req.params["id"];
		const userId = req.cookies[CONF_VAR.COOKIE_PID];
		this.topicRepository.deleteOne(id, userId).then((result) => {
			if (result.deletedCount === 0) {
				MyUtil.sendError(res);
				return;
			}
			res.send({
				id: id
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
			{ rule: reqBody.tags.every(tag => tag.length <= 6), msg: "タグは6文字以下で設定してください"},
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