/*
## SVG Libraies
- svgjs.com
- paperjs.org 
- github.com/andreaferretti/paths-js
- github.com/sebmarkbage/art
- github.com/reactjs/react-art

## Path Data Documentations
- developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
- developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
- css-tricks.com/svg-path-syntax-illustrated-guide/
- sitepoint.com/closer-look-svg-path-data/

## Bezier Curves Documentations
- stackoverflow.com/questions/13643864/how-to-get-the-outline-of-a-stroke
- pomax.github.io/bezierinfo/
- seant23.wordpress.com/2010/11/12/offset-bezier-curves/

## Path Builders
- polynom.co
- codepen.io/anthonydugois/full/mewdyZ
- css-tricks.com/tools-visualize-edit-svg-paths-kinda/

## Path Boolean Operations
- stackoverflow.com/questions/39125355/javascript-svg-vector-path-around-brush-strokes-for-a-brush-selection-tool
- paperjs.org/reference/pathitem/#unite-path

## Other
- https://www.diffchecker.com/diff
*/

// const { Path } = ReactART
// https://codedaily.io/tutorials/29/React-Art-and-Pathsjs

let _Path

// SVGPath from ART.js
// https://github.com/sebmarkbage/art/blob/master/modes/svg/path.js
(function() {
  function Class(mixins){
    var proto = {};
    for (var i = 0, l = arguments.length; i < l; i++){
      var mixin = arguments[i];
      if (typeof mixin == 'function') mixin = mixin.prototype;
      for (var key in mixin) proto[key] = mixin[key];
    }
    if (!proto.initialize) proto.initialize = function(){};
    proto.constructor = function(a,b,c,d,e,f,g,h){
      return new proto.initialize(a,b,c,d,e,f,g,h);
    };
    proto.constructor.prototype = proto.initialize.prototype = proto;
    return proto.constructor;
  };
  // Utility command factories

  var point = function(c){
    return function(x, y){
      return this.push(c, x, y);
    };
  };

  var arc = function(c, cc){
    return function(x, y, rx, ry, outer){
      return this.push(c, Math.abs(rx || x), Math.abs(ry || rx || y), 0, outer ? 1 : 0, cc, x, y);
    };
  };

  var curve = function(t, s, q, c){
    return function(c1x, c1y, c2x, c2y, ex, ey){
      var l = arguments.length, k = l < 4 ? t : l < 6 ? q : c;
      return this.push(k, c1x, c1y, c2x, c2y, ex, ey);
    };
  };

  // SVG Path Class

  var SVGPath = Class({

    initialize: function(path){
      if (path instanceof SVGPath){
        this.path = [Array.prototype.join.call(path.path, ' ')];
      } else {
        if (path && path.applyToPath)
          path.applyToPath(this);
        else
          this.path = [path || 'm0 0'];
      }
    },

    push: function(){
      this.path.push(Array.prototype.join.call(arguments, ' '));
      return this;
    },

    reset: function(){
      this.path = [];
      return this;
    },

    move: point('m'),
    moveTo: point('M'),

    line: point('l'),
    lineTo: point('L'),

    curve: curve('t', 's', 'q', 'c'),
    curveTo: curve('T', 'S', 'Q', 'C'),

    arc: arc('a', 1),
    arcTo: arc('A', 1),

    counterArc: arc('a', 0),
    counterArcTo: arc('A', 0),

    close: function(){
      return this.push('z');
    },

    toSVG: function(){
      return this.path.join(' ');
    }

  });

  SVGPath.prototype.toString = SVGPath.prototype.toSVG;
  
  // _Path = SVGPath;
})();

// Path from Path-js
// https://github.com/andreaferretti/paths-js/blob/9f38bae7ba68ef72450efe9d1a906ce9ff76f46e/src/path.js
// https://github.com/andreaferretti/paths-js/wiki/Low%20level%20API
(function() {
  Path = (init) => {
    let instructions = init || []

    let push = (arr, el) => {
      let copy = arr.slice(0, arr.length)
      copy.push(el)
      return copy
    }

    let areEqualPoints = ([a1, b1], [a2, b2]) =>
      (a1 === a2) && (b1 === b2)

    let trimZeros = (string, char) => {
      let l = string.length
      while (string.charAt(l - 1) === '0') {
        l = l - 1
      }
      if(string.charAt(l - 1) === '.') {
        l = l - 1
      }
      return string.substr(0, l)
    }

    let round = (number, digits) => {
      const str = number.toFixed(digits)
      return trimZeros(str)
    }

    let printInstrunction = ({ command, params }) => {
      let numbers = params.map((param) => round(param, 6))
      return `${ command } ${ numbers.join(' ') }`
    }

    let point = ({ command, params }, [prevX, prevY]) => {
      switch(command) {
        case 'm':
        case 'M':
          return [params[0], params[1]]
        case 'l':
        case 'L':
          return [params[0], params[1]]
        case 'H':
          return [params[0], prevY]
        case 'V':
          return [prevX, params[0]]
        case 'Z':
          return null
        case 'C':
          return [params[4], params[5]]
        case 'S':
          return [params[2], params[3]]
        case 'Q':
          return [params[2], params[3]]
        case 'T':
          return [params[0], params[1]]
        case 'A':
          return [params[5], params[6]]
      }
    }

    let verbosify = (keys, f) =>
      function(a) {
        let args = (typeof a === 'object') ? keys.map((k) => a[k]) : arguments
        return f.apply(null, args)
      }

    let plus = (instruction) =>
      Path(push(instructions, instruction))

    return ({
      move: verbosify(['x', 'y'], (x, y) =>
        plus({
          command: 'm',
          params: [x, y]
        })
      ),
      moveTo: verbosify(['x', 'y'], (x, y) =>
        plus({
          command: 'M',
          params: [x, y]
        })
      ),
      line: verbosify(['x', 'y'], (x, y) =>
        plus({
          command: 'l',
          params: [x, y]
        })
      ),
      lineTo: verbosify(['x', 'y'], (x, y) =>
        plus({
          command: 'L',
          params: [x, y]
        })
      ),
      hline: verbosify(['x'], (x) =>
        plus({
          command: 'h',
          params: [x]
        })
      ),
      hlineTo: verbosify(['x'], (x) =>
        plus({
          command: 'H',
          params: [x]
        })
      ),
      vline: verbosify(['y'], (y) =>
        plus({
          command: 'v',
          params: [y]
        })
      ),
      vlineTo: verbosify(['y'], (y) =>
        plus({
          command: 'V',
          params: [y]
        })
      ),
      closepath: () =>
        plus({
          command: 'Z',
          params: []
        }),
      curve: verbosify(['x1', 'y1', 'x2', 'y2','x', 'y'], (x1, y1, x2, y2, x, y) =>
        plus({
          command: 'c',
          params: [x1, y1, x2, y2, x, y]
        })
      ),
      curveTo: verbosify(['x1', 'y1', 'x2', 'y2','x', 'y'], (x1, y1, x2, y2, x, y) =>
        plus({
          command: 'C',
          params: [x1, y1, x2, y2, x, y]
        })
      ),
      smoothcurve: verbosify(['x2', 'y2','x', 'y'], (x2, y2, x, y) =>
        plus({
          command: 's',
          params: [x2, y2,x, y]
        })
      ),
      smoothcurveTo: verbosify(['x2', 'y2','x', 'y'], (x2, y2, x, y) =>
        plus({
          command: 'S',
          params: [x2, y2,x, y]
        })
      ),
      qcurve: verbosify(['x1', 'y1', 'x', 'y'], (x1, y1, x, y) =>
        plus({
          command: 'q',
          params: [x1, y1, x, y]
        })
      ),
      qcurveTo: verbosify(['x1', 'y1', 'x', 'y'], (x1, y1, x, y) =>
        plus({
          command: 'Q',
          params: [x1, y1, x, y]
        })
      ),
      smoothqcurve: verbosify(['x', 'y'], (x, y) =>
        plus({
          command: 't',
          params: [x, y]
        })
      ),
      smoothqcurveTo: verbosify(['x', 'y'], (x, y) =>
        plus({
          command: 'T',
          params: [x, y]
        })
      ),
      arc: verbosify(['rx', 'ry', 'xrot', 'largeArcFlag', 'sweepFlag', 'x', 'y'],
        (rx, ry, xrot, largeArcFlag, sweepFlag, x, y) =>
        plus({
          command: 'a',
          params: [rx, ry, xrot, largeArcFlag, sweepFlag, x, y]
        })
      ),
      arcTo: verbosify(['rx', 'ry', 'xrot', 'largeArcFlag', 'sweepFlag', 'x', 'y'],
        (rx, ry, xrot, largeArcFlag, sweepFlag, x, y) =>
        plus({
          command: 'A',
          params: [rx, ry, xrot, largeArcFlag, sweepFlag, x, y]
        })
      ),
      // print: () =>
      //   instructions.map(printInstrunction).join(' '),
      toString: () =>
        instructions.map(printInstrunction).join(' '),
      // points: () => {
      //   let ps = []
      //   let prev = [0, 0]
      //   for(let instruction of instructions) {
      //     let p = point(instruction, prev)
      //     prev = p
      //     if(p) {
      //       ps.push(p)
      //     }
      //   }
      //   return ps
      // },
    //   instructions: () =>
    //     instructions.slice(0, instructions.length),
    //   connect: function(path) {
    //     let ps = this.points()
    //     let last = ps[ps.length - 1]
    //     let first = path.points()[0]
    //     let newInstructions = path.instructions().slice(1)
    //     if (!areEqualPoints(last, first)) {
    //       newInstructions.unshift({
    //         command: "L",
    //         params: first
    //       })
    //     }
    //     return Path(this.instructions().concat(newInstructions))
    //   }
    })
  }

  // Path = Path;
})();

// Parse Patth
function cleanUpPath(d, type = 'arguments') {
  const letterRgx = /[a-z]/gi
  const numberRgx = /((?:-)?(?:\.)?[0-9]+(?:\.[0-9]+)?)/g
  const emptyRgx = /^(\s+)$/

  const isEven = n => n % 2 == 0
  const isOdd = n => Math.abs(n % 2) == 1

  const data = d
    .replace(letterRgx, m => '\n' + m + ' ')
    .split(/\n/g)
    .map(str => {
      const search = str.match(numberRgx)

      if (!search || !search.length > 2) {
        return str
      }

      const action = str[0] + str[1]

      return action + search
    })
    .filter(str => str.length !== 0)
    .filter(str => !emptyRgx.test(str))
  
  
  console.log(data.join('\n'))

  // transform to path.js
  if (type === 'arguments') {
    return 'Path()\n' + data
      .map(str => {
        const [commmand, _, ...coords] = str

        const args = coords.map(l => (l === ',' ? l + ' ' : l)).join('')

        switch (commmand) {
          case 'm':
            return `.move(${args})`
          case 'M':
            return `.moveTo(${args})`
          case 'l':
            return `.line(${args})`
          case 'L':
            return `.lineTo(${args})`
          case 'h':
            return `.hline(${args})`
          case 'H':
            return `.hlineTo(${args})`
          case 'v':
            return `.vline(${args})`
          case 'V':
            return `.vlineTo(${args})`
          case 'c':
            return `.curve(${args})`
          case 'C':
            return `.curveTo(${args})`
          case 's':
            return `.smoothcurve(${args})`
          case 'S':
            return `.smoothcurveTo(${args})`
          case 'q':
            return `.qcurve(${args})`
          case 'Q':
            return `.qcurveTo(${args})`
          case 'r':
            return `.smoothqcurve(${args})`
          case 'T':
            return `.smoothqcurveTo(${args})`
          case 'a':
            return `.arc(${args})`
          case 'A':
            return `.arcTo(${args})`
          case 'z':
          case 'Z':
            return `.closepath()`
          default:
            return str
        }
      })
      .join('\n')
  } else if (type === 'object') {
    return 'Path()\n' + data
      .map(str => {
        const [commmand, _, ...coords] = str

        const args = coords.join('').split(',')

        switch (commmand) {
          case 'm':
            return `.move({ x: ${args[0]}, y: ${args[1]} })`
          case 'M':
            return `.moveTo({ x: ${args[0]}, y: ${args[1]} })`
          case 'l':
            return `.line({ x: ${args[0]}, y: ${args[1]} })`
          case 'L':
            return `.lineTo({ x: ${args[0]}, y: ${args[1]} })`
          case 'h':
            return `.hline({ x: ${args[0]} })`
          case 'H':
            return `.hlineTo({ x: ${args[0]} })`
          case 'v':
            return `.vline({ y: ${args[0]} })`
          case 'V':
            return `.vlineTo({ y: ${args[0]} })`
          case 'c':
            return `.curve({ x1: ${args[0]}, y1: ${args[1]}, x2: ${args[2]}, y2: ${args[3]}, x: ${args[4]}, y: ${args[5]} })` 
          case 'C':
            return `.curveTo({ x1: ${args[0]}, y1: ${args[1]}, x2: ${args[2]}, y2: ${args[3]}, x: ${args[4]}, y: ${args[5]} })`
          case 's':
            return `.smoothcurve({ x2: ${args[0]}, y2: ${args[1]}, x: ${args[2]}, y: ${args[3]} })`
          case 'S':
            return `.smoothcurveTo({ x2: ${args[0]}, y2: ${args[1]}, x: ${args[2]}, y: ${args[3]} })`
          case 'q':
            return `.qcurve({ x1: ${args[0]}, y1: ${args[1]}, x: ${args[2]}, y: ${args[3]} })`
          case 'Q':
            return `.qcurveTo({ x1: ${args[0]}, y1: ${args[1]}, x: ${args[2]}, y: ${args[3]} })`
          case 't':
            return `.smoothqcurve({ x: ${args[0]}, y: ${args[1]} })`
          case 'T':
            return `.smoothqcurveTo({ x: ${args[0]}, y: ${args[1]} })`
          case 'a':
            return `.arc({ rx: ${args[0]}, ry: ${args[1]}, xrot: ${args[2]}, largeArcFlag: ${args[3]}, sweepFlag: ${args[4]}, x: ${args[5]}, y: ${args[6]} })`
          case 'A':
            return `.arcTo({ rx: ${args[0]}, ry: ${args[1]}, xrot: ${args[2]}, largeArcFlag: ${args[3]}, sweepFlag: ${args[4]}, x: ${args[5]}, y: ${args[6]} })`
          case 'z':
          case 'Z':
            return `.closepath()`
          default:
            return str
        }
      })
      .join('\n')
  } else {
    return data.join('\n')
  }
}




const { Component } = React
// const PropTypes = PropTypes
const { render } = ReactDOM
const { Motion, spring } = ReactMotion

function ratio(val, max) {
  return val / max
}

function centerRatio(val, max) {
  return ratio(val, max) - 1/2
}

const COLOR_HAIR_LIGHT = '#655546'
const COLOR_HAIR_MEDIUM = '#3D302C'
const COLOR_HAIR_DARK = '#261815'

const COLOR_SKIN_LIGHT = '#DDB684'
const COLOR_SKIN_MEDIUM = '#CBA576'
const COLOR_SKIN_DARK = '#997A53'

class Avatar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      moveX: 0,
      moveY: 0
    }
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove)
  }

  handleMouseMove = (e) => {
    const moveX = centerRatio(e.clientX, window.innerWidth) * 2
    const moveY = centerRatio(e.clientY, window.innerHeight) * 2

    this.setState({
      moveX,
      moveY
    })
  }


  render() {
    const { moveX, moveY } = this.state
    
    const HEAR_LEFT_PATH = Path()
      .moveTo(270.2, 457.1)
      .curve(-1, 12.7, -1.5, 25.6, -1.5, 38.6)
      .smoothcurve(1.5, 43.3, 4.3, 64)
    
    
    const HEAR_RIGHT_PATH = Path()
      .moveTo(689.8, 457.1)
      .curve(1, 12.7, 1.5, 25.6, 1.5, 38.6)
      .smoothcurve(-1.5, 43.3, -4.3, 64)

    const HEAR_TRANSFORM = `translate(${moveX * 20}, ${moveY * -20})`
    
    const HEAD_PATH = Path()
      .moveTo(480, 178.4)
      .curve(-116.7, 0, -211.4, 94.6, -211.4, 211.4)
      .vline(118.7)
      .hline(.2)
      .curve(4.4, 169.4, 97.3, 304.7, 211.2, 304.7)
      .smoothcurve(206.8, -135.3, 211.2, -304.7)
      .hline(.2)
      .vlineTo(389.7)
      .curve(0, -116.7, -94.6, -211.3, -211.4, -211.3)
      .closepath()
    
    const TRANSFORM_HEAD = `translate(${moveX * 30}, ${moveY * 10})`
    const TRANSFORN_HEAD_FOR_HAIR = `translate(${moveX * -30}, ${moveY * -30})`
    
    const HAIR_PATH = "M623.7 143.5l27.5 266c1.3 12.1 6.4 23.5 14.6 32.5 0 0 7.5 7.3 16.5 18.1 7.2 8.6 18.6 22.1 18.3 48.4-1.1 84.2-20.3 120-39.8 151.3-25.3 40.5-67.5 59.5-93.5 3.2-8.3-18-26.5-30.5-47.6-30.5H480h-39.7c-21.1 0-39.3 12.5-47.6 30.5-25.9 56.3-68.2 37.4-93.5-3.2-19.5-31.3-38.7-67.1-39.8-151.3-.3-26.2 11.1-39.7 18.3-48.4 9-10.8 16.5-18.1 16.5-18.1 8.2-9 13.4-20.4 14.6-32.5l27.5-266H199.4v730.3h561.2V143.5H623.7zm-86.3 541.3c0 9.6-7.9 17.5-17.5 17.5h-80c-9.6 0-17.5-7.9-17.5-17.5s7.9-17.5 17.5-17.5h80c9.7 0 17.5 7.9 17.5 17.5z"
    
    const TRANSFORM_FACE = `translate(${moveX * 60}, ${moveY * 40})`
    
    // move with face
    const HAIR_QUIFF_PATH = Path()
       .moveTo(438.3, 198.9)
      .curve(-70.4, 0, -127.5, 57.1, -127.5, 127.5)
      .curve(0, 44.2, 22.5, 83.2, 56.7, 106.1)
      .curve(6.6, -33, 35.8, -57.9, 70.8, -57.9)
      .hline(175.7 + Math.abs(moveX) * -15)
      .curve(70.4, 0, 127.5, -57.1, 127.5, -127.5)
      .curve(0, -53.1, -32.5, -98.6, -78.6, -117.8)
      .curve(2, 5.5, 3.1, 11.5, 3.1, 17.7)
      .curve(0, 28.7, -23.3, 52, -52, 52)
      .hline(-175.7 + Math.abs(moveX) * -15)
      .closepath()
    
    const HAIR_QUIFF_TRANSFORM = `translate(${moveX * 60}, ${moveY * 60})`
    
    const NECK_SHADOW_PATH = Path()
      .move(320.2, 632.4)
      .vline(133.1)
      .curve(27.8, 47.3, 114.6, 114.4, 159.6, 114.5)
      .curve(45, 0, 132.7, -66.8, 160, -115)
      .vline(-132.6)
      .hline(-319.6)
      .closepath()
    
    const NECK_SKIN_PATH = Path()
      .moveTo(320.2, 632.4)
      .vline(133.1)
      .curve({
        x1: 27.7 + (moveX * 10), y1: 38.9,
        x2: 114.6 + (moveX * 10), y2: 90.3,
        x: 159.6 + (moveX * 10), y: 90.3
      })
      .curve({
        x1: 45 + (moveX * 10), y1: 0,
        x2: 132.7 - (moveX * 10), y2: -51.1,
        x: 160 - (moveX * 10), y: -90.8
      })
      .vline(-132.6)
      .hline(-319.6)
      .closepath()
    
    const HAIRLINE_DIFF = 80
    
    const HAIRLINE_PATH = Path()
      .move(199.4, 146.9)
      .vline(226.6 - (moveY * HAIRLINE_DIFF / 2))
      .curve({
        x1: 67.9, y1: 0 + (moveY * HAIRLINE_DIFF * 2/3),
        x2: 168.4, y2: 0 + (moveY * HAIRLINE_DIFF),
        x: 280.6, y: 0 + (moveY * HAIRLINE_DIFF)
      })
      .smoothcurve({
        x2: 212.6, y2: 0 - (moveY * HAIRLINE_DIFF * 1/3),
        x: 280.6, y: 0 - (moveY * HAIRLINE_DIFF)
      })
      .vline(-226.6 + (moveY * HAIRLINE_DIFF / 2))
      .closepath()
    
    const TRANSFORM_HAIRLINE = `translate(${moveX * 60}, ${moveY * 20})`

    return (
      <svg viewBox="0 0 960 960">
        <defs>
          <clipPath id="HeadClipPath">
            <path
              d={HEAD_PATH}
              transform={TRANSFORM_HEAD}
            />
          </clipPath>
          <clipPath id="HeadForHairClipPath">
            <path
              d={HEAD_PATH}
              transform={TRANSFORN_HEAD_FOR_HAIR}
            />
          </clipPath>
          <clipPath id="HairClipPath">
            <path
              clipPath="url(#HeadForHairClipPath)"
              d={HAIR_PATH}
              transform={TRANSFORM_FACE}
            />
          </clipPath>
        </defs>
        
        <path
          id="neckBackGround"
          fill={COLOR_SKIN_DARK}
          d={NECK_SHADOW_PATH}
        />
        
        <path
          id="neckForeGround"
          fill={COLOR_SKIN_MEDIUM}
          d={NECK_SKIN_PATH}
        />

        <path
          id="leftHear"
          fill="none"
          stroke={COLOR_SKIN_LIGHT}
          strokeWidth="36"
          strokeLinecap="round"
          transform={HEAR_TRANSFORM}
          d={HEAR_LEFT_PATH}
        />
        
        <path
          id="rightHear"
          fill="none"
          stroke={COLOR_SKIN_LIGHT}
          strokeWidth="36"
          strokeLinecap="round"
          transform={HEAR_TRANSFORM}
          d={HEAR_RIGHT_PATH}
        />
        
        <g id="face" clipPath="url(#HeadClipPath)">
          <rect
            fill={COLOR_SKIN_LIGHT}
            x="199.4" y="143.5"
            width="561.2" height="730.3"
            transform={TRANSFORM_FACE}
          />
        </g>
        
        <g id="hair" clipPath="url(#HairClipPath)">
          <rect
            fill={COLOR_HAIR_MEDIUM}
            x="199.4" y="143.5"
            width="561.2" height="730.3"
            transform={TRANSFORM_FACE}
          />
          <ellipse
            fill={COLOR_HAIR_LIGHT}
            cx="480" cy="508.6"
            rx="280.6" ry="123.8"
            transform={TRANSFORM_FACE}
          />
        </g>
        
        <g id="hairline" clipPath="url(#HeadClipPath)">
          <path 
            fill={COLOR_HAIR_DARK}
            d={HAIRLINE_PATH}
            transform={TRANSFORM_HAIRLINE}
          />
        </g>

        <path
          id="hairQuiff"
          fill={COLOR_HAIR_MEDIUM}
          d={HAIR_QUIFF_PATH}
          transform={HAIR_QUIFF_TRANSFORM}
        />
      </svg>
    )
  }
}

ReactDOM.render(
  <Avatar />,
  document.getElementById('render')
)
