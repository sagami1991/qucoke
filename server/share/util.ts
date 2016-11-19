import {CONF_VAR,
	TopicInfo,
	TopicEditForm,
	ValidateRule
} from "./Interfaces";
import {Express, Request, Response} from 'express';
import * as marked from "marked";

class MyRenderer extends marked.Renderer {
	link(href: string, title: string, text: string) {
		return `<a href="${href}" target="_blank">${text}</a>`;
	}
}

export function getMarked() {
	marked.setOptions({renderer: new MyRenderer()});
	return marked;
}


export class MyUtil {
	static validate(rules: ValidateRule[]) {
		for ( let {rule, msg} of rules) {
			if (!rule) {
				const errMsg = msg ? msg : CONF_VAR.ERR_MSG.unexpected_error;
				throw new Error(errMsg);
			}
		}
	}

	static sendError(res: Response, message?: string) {
		const errMsg = message ? message : CONF_VAR.ERR_MSG.unexpected_error;
		res.status(500).send({message: errMsg});
	}
}