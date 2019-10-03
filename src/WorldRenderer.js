
function renderFixture(ctx, f) {
    const type = f.getType();
    const shape = f.getShape();

    if (type === 'circle') {
        drawCircle(ctx, shape);
    }
    if (type === 'edge') {
        drawEdge(ctx, shape);
    }
    if (type === 'polygon') {
        drawPolygon(ctx, shape);
    }
    if (type === 'chain') {
        drawChain(ctx, shape);
    }
}

export default function render(ctx, world) {
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';

    for (let b = world.getBodyList(); b; b = b.getNext()) {
        const pos = b.getPosition();
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(b.getAngle());
        for (let f = b.getFixtureList(); f; f = f.getNext()) {
            renderFixture(ctx, f)
        }
        ctx.restore();
    }
}

function drawCircle(ctx, shape) {
    const r = shape.getRadius();
    const cx = 0, cy = 0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();
}

/*function drawEdge(ctx, edge) {
    return;
    var lw = options.lineWidth;
    var ratio = options.ratio;

    var v1 = edge.m_vertex1;
    var v2 = edge.m_vertex2;

    var dx = v2.x - v1.x;
    var dy = v2.y - v1.y;

    var length = Math.sqrt(dx * dx + dy * dy);

    var texture = Stage.canvas(function(ctx) {

        this.size(length + 2 * lw, 2 * lw, ratio);

        ctx.scale(ratio, ratio);
        ctx.beginPath();
        ctx.moveTo(lw, lw);
        ctx.lineTo(lw + length, lw);

        ctx.lineCap = 'round';
        ctx.lineWidth = options.lineWidth;
        ctx.strokeStyle = options.strokeStyle;
        ctx.stroke();
    });

    var minX = Math.min(v1.x, v2.x);
    var minY = Math.min(options.scaleY * v1.y, options.scaleY * v2.y);

    var image = Stage.image(texture);
    image.rotate(options.scaleY * Math.atan2(dy, dx));
    image.offset(minX - lw, minY - lw);
    var node = Stage.create().append(image);
    return node;
};*/

function drawPolygon(ctx, shape) {
    const vertices = shape.m_vertices;

    if (!vertices.length) {
        return;
    }
    ctx.beginPath();
    for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        const x = v.x, y = v.y;
        if (i === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);
    }

    if (vertices.length > 2) {
        ctx.closePath();
    }
    ctx.stroke();
}

/*
Viewer.prototype.drawChain = function(shape, options) {
    var lw = options.lineWidth;
    var ratio = options.ratio;

    var vertices = shape.m_vertices;

    if (!vertices.length) {
        return;
    }

    var minX = Infinity, minY = Infinity;
    var maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < vertices.length; ++i) {
        var v = vertices[i];
        minX = Math.min(minX, v.x);
        maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, options.scaleY * v.y);
        maxY = Math.max(maxY, options.scaleY * v.y);
    }

    var width = maxX - minX;
    var height = maxY - minY;

    var texture = Stage.canvas(function(ctx) {

        this.size(width + 2 * lw, height + 2 * lw, ratio);

        ctx.scale(ratio, ratio);
        ctx.beginPath();
        for (var i = 0; i < vertices.length; ++i) {
            var v = vertices[i];
            var x = v.x - minX + lw;
            var y = options.scaleY * v.y - minY + lw;
            if (i == 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        }

        // TODO: if loop
        if (vertices.length > 2) {
            // ctx.closePath();
        }

        if (options.fillStyle) {
            ctx.fillStyle = options.fillStyle;
            ctx.fill();
            ctx.closePath();
        }

        ctx.lineCap = 'round';
        ctx.lineWidth = options.lineWidth;
        ctx.strokeStyle = options.strokeStyle;
        ctx.stroke();
    });

    var image = Stage.image(texture);
    image.offset(minX - lw, minY - lw);
    var node = Stage.create().append(image);
    return node;
};*/
