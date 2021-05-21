class Editor {
    constructor(selector) {
        this.container = document.querySelector(selector)

        this.highlight = document.createElement('pre')
        this.highlight.classList.add('highlight')

        this.editor = document.createElement('textarea')
        this.editor.setAttribute('spellcheck', 'false')
        this.editor.classList.add('editor')
        this.editor.addEventListener('keydown', function (e) {
            if (e.key == 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;

                // set textarea value to: text before caret + tab + text after caret
                this.value = this.value.substring(0, start) +
                    "\t" + this.value.substring(end);

                // put caret at right position again
                this.selectionStart =
                    this.selectionEnd = start + 1;
            }
        })
        this.editor.addEventListener('input', () => {
            const scrollPosition = [this.container.scrollTop, this.container.scrollLeft]
            const lines = this.editor.value.split('\n').length
            this.editor.setAttribute('rows', lines)
            this.editor.style.width = '0px'

            this.highlight.innerHTML = Prism.highlight(this.editor.value, Prism.languages.javascript, 'javascript')
            this.editor.style.width = this.container.scrollWidth + 'px'
            this.highlight.style.marginBottom = `-${this.highlight.offsetHeight}px`
            this.container.scrollTop = scrollPosition[0]
            this.container.scrollLeft = scrollPosition[1]
        })

        this.container.appendChild(this.highlight)
        this.container.appendChild(this.editor)
    }
    set value(text) {
        this.editor.value = text
        const event = new Event('input')
        this.editor.dispatchEvent(event)
    }
    get value() {
        return this.editor.value
    }
}
export default Editor