const w : number = window.innerWidth, h : number = window.innerHeight, nodes : number = 4

class LinkedXRecStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : LinkedXRecStage = new LinkedXRecStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0

    prevScale : number = 0

    dir : number = 0

    update(cb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class XRNode {
    state : State = new State()

    prev : XRNode

    next : XRNode

    constructor(private i : number) {

    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new XRNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const rot : number = (2 * Math.PI)/nodes
        const size : number = Math.min(w, h) / 3
        context.save()
        context.translate(w/2, h/2)
        context.rotate(rot * this.i + Math.PI/4 + rot * this.state.scale)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, -size)
        context.stroke()
        context.restore()
    }

    getNext(dir : number, cb : Function) {
        var curr : XRNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedXR {

    curr : XRNode = new XRNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        context.strokeStyle = '#2ecc71'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
