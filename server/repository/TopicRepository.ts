import {Collection, ObjectID} from 'mongodb';
import {
	TopicInfo,
	Comment,
	TopicEditForm
} from "../share/Interfaces";

export class TopicRepository {
	constructor(private topicsDb: Collection) {}

	public findOne(id: string): Promise<TopicInfo> {
		return this.topicsDb.findOne({_id: new ObjectID(id)});
	}

	public findAllForList(limit: number, skip: number, where?: {[key: string]: string}) {
		return this.topicsDb.find(where ? where : {}, {
			_id: 1,
			postDate: 1,
			title: 1,
			commentCount: 1,
			viewCount: 1,
			tags: 1,
			favoriteCount: 1
		 }).skip(skip).limit(limit).sort({ $natural: -1 });
	}

	public addOne(topic: TopicInfo) {
		return this.topicsDb.insertOne(topic);
	}

	public updateOne(topic: TopicEditForm) {
		return this.topicsDb.updateOne({
			_id: new ObjectID(topic._id),
			userId: topic.userId
		}, {
			$set: {
				title: topic.title,
				tags: topic.tags,
				bodyMd: topic.bodyMd,
				bodyHtml: topic.bodyHtml,
				editDate: new Date()
			}
		});
	}

	public deleteOne(id: string, userId: string) {
		return this.topicsDb.deleteOne({
			_id: new ObjectID(id),
			userId: userId
		});
	}
	public addComment(topicId: string, comment: Comment) {
		return this.topicsDb.update(
			{_id: new ObjectID(topicId)},
			{
				$inc: {commentCount: 1},
				$push: {comments: comment}
			});
	}

	public addViewCount(topicId: string) {
		return this.topicsDb.update(
			{_id: new ObjectID(topicId)},
			{
				$inc: {viewCount: 1},
			}
		);
	}
	/** 1分以内に登録したレコードがあるかチェック */
	public checkRecentPost(userId: string) {
		const date = new Date();
		date.setMinutes(date.getMinutes() - 1);
		return this.topicsDb.find({postDate: {$gt: date }, userId: userId}, {_id: 1})
		.limit(1);
	}

}