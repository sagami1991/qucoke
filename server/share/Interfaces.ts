
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

export interface Comment {
	postDate: Date;
	body: string;
}

