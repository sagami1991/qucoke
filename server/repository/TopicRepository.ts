import {Collection, ObjectID} from 'mongodb';
import {
	TopicInfo,
	Comment
} from "../share/Interfaces";

export class TopicRepository {
	constructor(private topicsDb: Collection) {}

	public findOne(id: string): Promise<TopicInfo> {
		return this.topicsDb.findOne({_id: new ObjectID(id)});
	}

	public findAllForList(limit: number) {
		return this.topicsDb.find({}, {
			_id: 1,
			postDate: 1,
			title: 1,
			commentCount: 1,
			viewCount: 1,
			tags: 1,
			favoriteCount: 1
		 }).limit(limit);
	}

	public addOne(topic: TopicInfo) {
		return this.topicsDb.insertOne(topic);
	}

	public addComment(topicId: string, comment: Comment) {
		return this.topicsDb.update(
			{_id: new ObjectID(topicId)},
			{
				$inc: {commentCount: 1},
				$push: {comments: comment}
			});
	}

	/** 1分以内に登録したレコードがあるかチェック */
	public checkRecentPost(userId: string) {
		const date = new Date();
		date.setMinutes(date.getMinutes() - 1);
		return this.topicsDb.find({postDate: {$gt: date }, userId: userId}, {_id: 1})
		.limit(1);
	}

}