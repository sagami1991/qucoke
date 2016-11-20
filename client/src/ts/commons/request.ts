import "core-js/es6/promise";
import {SmartDialog, IconType} from "../commons/smart-dialog";

interface MyRequestOption {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	reqBody?: any;
	query?: {
		key: string,
		value: string | boolean | number
	}[];
}

 export class MyRequest {
	 /** JSONのみ対応 */
	 static rest<T>(option: MyRequestOption): Promise<T> {
		this.toggleLoadingAnime(true);
		return new Promise<T>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const url = !option.query ? option.path :
				option.path + "?" + option.query.map(q => `${q.key}=${q.value}&`);
			xhr.open(option.method, url);
			xhr.onload = () => {
				this.toggleLoadingAnime(false);
				if (xhr.status !== 200) {
					SmartDialog.open({
						dialogType: "ERROR",
						msg: xhr.status === 404 ? "404 NOTFOUND" : JSON.parse(xhr.responseText).message
					});
				} else {
					resolve(JSON.parse(xhr.responseText));
				}
			};
			xhr.onerror = () => {
				this.toggleLoadingAnime(false);
				reject();
			};
			if (option.reqBody) {
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xhr.send(JSON.stringify(option.reqBody));
			} else {
				xhr.send();
			}
		}).catch((err) => {
			this.toggleLoadingAnime(false);
			SmartDialog.open({
				dialogType: "ERROR",
				msg: "予期せぬエラーが発生しました"
			});
		});
	 }

	 public static toggleLoadingAnime(isOn: boolean) {
		 document.body.classList.toggle("loading", isOn);
	 }

	 /** ページ遷移 */
	 public static navigatePage(url: string) {
		 this.toggleLoadingAnime(true);
		 window.location.href = url;
	 }
 }