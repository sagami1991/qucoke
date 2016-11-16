import "core-js/es6/promise";
import "core-js/es6/array";
require("./smart-dialig.scss");
export enum IconType {
    success,
    info,
    warn,
    error,
    help
}

export interface SmartDialogOption {
    dialogType: "ALERT" | "CONFIRM" | "ERROR";
    iconType?: IconType;
    title?: string;
    msg: string;
    okCb?: () => any;
    cancelCb?: () => any;
}

export class SmartDialog {
    private static ICON_INFO = [
        {
            type: IconType.success,
            icon: "check_circle",
            class: IconType[IconType.success],
            title: "成功"
        }, {
            type: IconType.info,
            icon: "info",
            class: IconType[IconType.info],
            title: "情報"
        }, {
            type: IconType.warn,
            icon: "warning",
            class: IconType[IconType.warn],
            title: "警告"
        }, {
            type: IconType.error,
            icon: "error",
            class: IconType[IconType.error],
            title: "エラー"
        }, {
            type: IconType.help,
            icon: "help",
            class: IconType[IconType.info],
            title: "確認"
        }
    ];

    private $wrapper: HTMLElement;
    private $dialog: HTMLElement;
    private $cancelBtn: HTMLElement;
    private $okBtn: HTMLElement;
    public static open(option: SmartDialogOption): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            option.okCb = () => resolve();
            option.cancelCb = () => reject();
            if (option.iconType === undefined) {
                option.iconType = option.dialogType === "ALERT" ? IconType.info :
					option.dialogType === "ERROR" ? IconType.error : IconType.help;
            }
            new SmartDialog(option).init();
        });
    }
    constructor(private option: SmartDialogOption) {}

    private init() {
        this.$wrapper = document.createElement("div");
        this.$wrapper.id = "smart-dialog";
        this.$wrapper.innerHTML = this.createHtml();
        this.$dialog = <HTMLElement> this.$wrapper.querySelector(".smd-dialog");
        this.$cancelBtn = <HTMLElement> this.$wrapper.querySelector(".smd-btn-cancel");
        this.$okBtn = <HTMLElement> this.$wrapper.querySelector(".smd-btn-ok");
        this.show();
        this.registerEvent();
    }
    private registerEvent() {
        this.$cancelBtn ? this.$cancelBtn.addEventListener("click", () => this.close(false)) : null;
        this.$okBtn     ? this.$okBtn.addEventListener("click", () => this.close(true)) : null;
    }

    private show() {
        document.body.appendChild(this.$wrapper);
        // document.body.classList.add("no-scrolling");
        this.$dialog.classList.add("smd-show");
        this.$dialog.style.marginTop = `-${this.$dialog.offsetHeight / 2}px`;
    }

    private close(isOk: boolean) {
        // document.body.classList.remove("no-scrolling");
        this.$dialog.classList.add("smd-hide");
        setTimeout(() => {
            this.$wrapper.parentNode.removeChild(this.$wrapper);
            isOk ? this.option.okCb() : this.option.cancelCb();
        }, 150);

    }

    private createHtml() {
        const icon = SmartDialog.ICON_INFO.find(info => info.type === this.option.iconType);
        return `
        <div class="smd-overlay" tabindex="-1"></div>
        <div class="smd-dialog">
            <div class="smd-title">${this.option.title ? this.option.title : icon.title}</div>
            <div class="smd-content">
                <i class="material-icons ${icon.class}">${icon.icon}</i>
                <div class="smd-message">${this.option.msg}</div>
            </div>
            <div class="smd-form">
                ${this.option.dialogType === "CONFIRM" ? `<button class="smd-btn smd-btn-cancel">キャンセル</button>` : "" }
                <button class="smd-btn smd-btn-ok">OK</button>
            </div>
        </div>`;
    }
}
