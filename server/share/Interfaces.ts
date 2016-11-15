
export const CONF_VAR =  {
	COOKIE_PID: "qucoke-person-id",
	ERR_MSG: {
		unexpected_error: "予期せぬエラーが発生しました",
	}
};

export interface ValidateRules {
	rule: boolean;
	msg?: string;
}

export interface TopicInfo {
	id: string;
    postDate: Date;
    title: string;
    commentCount: number;
    viewCount: number;
    tags: string[];
	bodyMd: string;
	bodyHtml: string;
	comments: Comment[];
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