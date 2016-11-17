import {Express, Request, Response} from 'express';
import {Collection} from 'mongodb';
import {CONF_VAR,
	TopicInfo,
	TopicEditForm,
	ValidateRule,
	Comment
} from "../share/Interfaces";

import {MyUtil, getMarked} from "../share/util";
import * as marked from "marked";
import {TopicRepository} from "../repository/TopicRepository";

export class TopicController {
	constructor(private app: Express,
				private topicRepository: TopicRepository) {}
	public init() {
		this.app.get('/topic/:id', (req, res) => this.getTopic(req, res));
		this.app.get("/api/topics", (req, res) => this.getTopics(req, res));
		this.app.post("/api/topic/:id/comment/", (req, res) => this.addComment(req, res));
		this.app.post("/api/topic", (req, res) => this.addTopic(req, res));
	}

	/** 記事一覧を渡す */
	private getTopics(req: Request, res: Response) {
		this.topicRepository.findAllForList(30).toArray((err, arr) => {
		if (err) {
			MyUtil.sendError(res, err.message);
			return;
		}
		res.send(arr.sort((bef, af ) => af.postDate - bef.postDate));
		});
	}

	private getTopic(req: Request, res: Response) {
		this.topicRepository.findOne(req.params["id"]).then((topic) => {
			if (!topic) {
				MyUtil.sendError(res, "存在しない記事です。");
				return;
			}
			res.render("topic", {title: topic.title, topic: topic});
		});
	}

	/** 記事を新規投稿 */
	private addTopic(req: Request, res: Response) {
		const reqBody = <TopicEditForm> req.body;
		MyUtil.validate(this.validateTopicEditForm(reqBody));
		const userId = req.cookies[CONF_VAR.COOKIE_PID]
		const topic: TopicInfo = {
			postDate: new Date(),
			title: reqBody.title,
			commentCount: 0,
			viewCount: 0,
			tags: reqBody.tags,
			bodyMd: reqBody.bodyMd,
			bodyHtml: getMarked()(reqBody.bodyMd),
			userId: userId,
			comments: [],
			favoriteCount: 0
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

	private validateComment(reqBody: Comment): ValidateRule[] {
		return [
			{ rule: typeof reqBody.body === "string"},
			{ rule: reqBody.body.length > 0, msg: "コメントが未入力です"},
			{ rule: reqBody.body.length < 1000, msg: "コメントは1000文字以内で入力してください"},
		];
	}
}