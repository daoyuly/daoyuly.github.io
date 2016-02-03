/**
 * Created by liudaoyu on 16/2/3.
 */

$(document).ready(function () {


    getClientHeight = function (doc) {
        var _doc = doc || document;
        return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientHeight : _doc.body.clientHeight;
    };

    getClientWidth = function (doc) {
        var _doc = doc || document;
        return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientWidth : _doc.body.clientWidth;
    };


    function skyStar(canvas, bg, fps) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.starList = [];
        this.fps = fps;
        this.bg = bg;
    }


    skyStar.prototype = {
        constructor: skyStar,
        random: function (t) {
            return Math.floor(Math.random() * t);
        },
        getDistance: function (t, e) {
            return Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
        },
        blinking: function (t) {
            var e = t.blinking
                , n = 3;
            e.blinkIndex < n ? (t.size *= e.scale,
                e.blinkIndex++) : n <= e.blinkIndex && e.blinkIndex < 2 * n ? (t.size /= e.scale,
                e.blinkIndex++) : e.blinkIndex = 0
        },
        glowing: function (t) {
            var e = t.glow.glowLength
                , n = e.maxLength - e.minLength
                , i = 2;
            t.glow.glowIndex < n * i ? (e.presentLength += .5,
                t.glow.glowIndex++) : n * i <= t.glow.glowIndex && t.glow.glowIndex < n * i * 2 ? (e.presentLength -= .5,
                t.glow.glowIndex++) : (e.presentLength = e.minLength,
                t.glow.glowIndex = 1)
        },
        twinkle: function (t) {
            var e = t.style
                , n = e.endStyle.r - e.startStyle.r
                , i = e.endStyle.g - e.startStyle.g
                , o = e.endStyle.b - e.startStyle.b
                , s = e.endStyle.a - e.startStyle.a
                , r = 10;
            e.twinkleIndex < r ? (e.presentStyle.r += Math.floor(n / r),
                e.presentStyle.g += Math.floor(i / r),
                e.presentStyle.b += Math.floor(o / r),
                e.presentStyle.a += Math.floor(s / r),
                e.twinkleIndex++) : r <= e.twinkleIndex && e.twinkleIndex < 2 * r ? (e.presentStyle.r -= Math.floor(n / r),
                e.presentStyle.g -= Math.floor(i / r),
                e.presentStyle.b -= Math.floor(o / r),
                e.presentStyle.a -= Math.floor(s / r),
                e.twinkleIndex++) : e.twinkleIndex = 0,
            e.presentStyle.r > 255 && (e.presentStyle.r = 255),
            e.presentStyle.g > 255 && (e.presentStyle.g = 255),
            e.presentStyle.b > 255 && (e.presentStyle.b = 255),
            e.presentStyle.a > 1 && (e.presentStyle.a = 1),
            e.presentStyle.r < 0 && (e.presentStyle.r = 0),
            e.presentStyle.g < 0 && (e.presentStyle.g = 0),
            e.presentStyle.b < 0 && (e.presentStyle.b = 0),
            e.presentStyle.a < 0 && (e.presentStyle.a = 0)
        },
        create: function () {
            var t = this.random(this.clientWidth);
            var e = this.random(this.clientHeight);
            var n = Math.abs(t - this.center.x) / this.center.x;
            var i = Math.floor(100 * n);
            var o = .6 * this.random(6);
            var s = {
                x: Math.abs(t - this.center.x),
                y: Math.abs(e - this.center.y)
            };
            var r = {
                basic: 1,
                para: Math.floor(this.getDistance(s, this.center) / this.getDistance(this.center, {
                        x: 0,
                        y: 0
                    }) * 100) / 100 - .1
            };
            var a = Math.ceil(10 * (t - this.center.x));
            var l = Math.ceil(10 * (e - this.center.y));
            var c = 2;
            var h = {
                start: 1,
                blinkIndex: 0,
                scale: 1.03
            };
            var d = {
                startStyle: {
                    r: 255,
                    g: 255,
                    b: 165,
                    a: 1
                },
                endStyle: {
                    r: 255,
                    g: 255,
                    b: 235,
                    a: 1
                },
                presentStyle: {
                    r: 255,
                    g: 255,
                    b: 160,
                    a: 1
                },
                twinkleIndex: 1,
                start: 1
            };
            var u = {
                glowLength: {
                    maxLength: 6,
                    minLength: 2,
                    presentLength: 2
                },
                glowColor: {
                    startColor: {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 1
                    },
                    endColor: {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 1
                    },
                    presentColor: {
                        r: 255,
                        g: 255,
                        b: 210,
                        a: 1
                    }
                },
                glowIndex: 1,
                start: 1
            };
            this.starList.push({
                p_x: t,
                p_y: e,
                p_z: i,
                v_x: a,
                v_y: l,
                size: o,
                style: d,
                alpha: r,
                speed: c,
                glow: u,
                blinking: h
            })
        },
        render: function () {
            this.canvas.height = this.clientHeight;
            this.canvas.width = this.clientWidth;
            this.ctx.globalAlpha = .8;
            this.ctx.shadowColor = "rgba(0,0,0,0)";
            this.ctx.shadowBlur = 0;
            for (var t = 0, e = this.starList.length; e > t; t++) {
                var n = this.starList[t];
                this.ctx.globalAlpha = n.alpha.basic * n.alpha.para;
                var i = n.style.presentStyle;
                this.ctx.fillStyle = "rgba(" + i.r + "," + i.g + "," + i.b + "," + i.a + ")";
                this.ctx.beginPath();
                1 == n.blinking.start && this.blinking(n);
                1 == n.glow.start && this.glowing(n);
                1 == n.style.start && this.twinkle(n);
                this.ctx.arc(n.p_x, n.p_y, n.size, 0, 2 * Math.PI, !0);
                this.ctx.closePath();
                this.ctx.fill();
                var o = n.glow.glowColor.presentColor;
                this.ctx.shadowColor = "rgba(" + o.r + "," + o.g + "," + o.b + "," + o.a + ")";
                this.ctx.shadowBlur = n.glow.glowLength.presentLength;
            }
        },
        startTimer: function () {
            var self = this;
            this.timer = setInterval(function () {
                self.move();
                self.render();
            }, this.fps)
        },
        move: function () {
            var self = this;

            for (var e = 0, n = self.starList.length; n > e; e++) {
                var star = self.starList[e];
                if ((star.p_x < 0 || star.p_x > self.canvas.width || star.p_y < 0 || star.p_y > self.canvas.height) && (star.p_x = self.center.x,
                        star.p_y = self.center.y,
                        star.size = .6),
                    0 === star.v_x) {
                    star.v_y > 0 ? star.p_y += star.speed : star.p_y -= star.speed;
                }

                else if (0 === star.v_y) {
                    star.v_x > 0 ? star.p_x += star.speed : star.p_x -= star.speed;
                }

                else {
                    var o = Math.pow(star.speed, 2)
                        , s = Math.abs(star.v_x / star.v_y)
                        , r = Math.sqrt(o / Math.pow(s + 1, 2))
                        , a = s * r;
                    star.v_x > 0 ? (star.p_x += a,
                        star.v_y > 0 ? star.p_y += r : star.p_y -= r) : (star.p_x -= a,
                        star.v_y > 0 ? star.p_y += r : star.p_y -= r)
                }

                if (star.size < 12) {
                    star.size += .01
                }

            }
        },
        init: function () {
            var len = 80;
            this.clientWidth = getClientWidth();
            this.clientHeight = getClientHeight();
            this.center = {
                x: this.clientWidth / 2,
                y: this.clientHeight / 2
            };
            for (var e = 0; len > e; e++) {
                this.create();
            }

            this.render();
            this.startTimer();
        },
        destory: function () {
            clearInterval(this.timer),
                this.canvas.width = getClientWidth(),
                this.canvas.height = getClientHeight()
        }
    };


    var bg = "rgba(0,29,56,1)";
    var fps = 60;
    var g = new skyStar(document.getElementById("c_star"), bg, fps);
    g.init();

});