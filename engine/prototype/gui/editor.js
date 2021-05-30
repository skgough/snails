class Editor {
    constructor(selector) {
        this.textarea = document.querySelector(selector)
        this.editor = CodeMirror.fromTextArea(this.textarea, {
            lineNumbers: true,
            smartIndent: true,
            indentWithTabs: true,
            theme:'xq-light',
            mode:  "javascript"
        })
        this.editor.on('change', () => {
            const change = document.createEvent('Event')
            change.initEvent('input',true,true)
            this.textarea.dispatchEvent(change)
        })
    }
    set value(text) {
        this.editor.setValue(text)
    }
    get value() {
        return this.editor.getValue()
    }
}
export default Editor