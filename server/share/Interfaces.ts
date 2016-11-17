
export const CONF_VAR =  {
	COOKIE_PID: "qucoke-person-id",
	COOKIE_ACCESSED: "topic-accessed",
	ERR_MSG: {
		unexpected_error: "予期せぬエラーが発生しました",
	}
};

export interface ValidateRule {
	rule: boolean;
	msg?: string;
}

export interface TopicInfo {
	_id?: string;
    postDate: Date;
    title: string;
	/** DBのカラムでは生成しない */
    commentCount: number;
    viewCount: number;
    tags: string[];
	bodyMd: string;
	bodyHtml: string;
	userId: string;
	comments: Comment[];
	favoriteCount: number;
}

export interface TopicEditForm {
	title: string;
	tags: string[];
	bodyMd: string;
}

export interface Comment {
	postDate: Date;
	body: string;
}

export interface ResPostTopic {
	id: string;
}