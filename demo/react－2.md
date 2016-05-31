/**
 * ------------------ The Life-Cycle of a Composite Component ------------------
 *
 * - constructor: Initialization of state. The instance is now retained.
 *   - componentWillMount
 *   - render
 *   - [children's constructors]
 *     - [children's componentWillMount and render]
 *     - [children's componentDidMount]
 *     - componentDidMount
 *
 *       Update Phases:
 *       - componentWillReceiveProps (only called if parent updated)
 *       - shouldComponentUpdate
 *         - componentWillUpdate
 *           - render
 *           - [children's constructors or receive props phases]
 *         - componentDidUpdate
 *
 *     - componentWillUnmount
 *     - [children's componentWillUnmount]
 *   - [children destroyed]
 * - (destroyed): The instance is now blank, released by React and ready for GC.
 *
 * -----------------------------------------------------------------------------
 */
 
 http://naotu.baidu.com/file/e74103a3c3ebacb953453c01d8015bdf?token=b42d1462a05adc66
 
 
 http://naotu.baidu.com/file/359f91941ab811ff5a3b2088a1bcfb1a?token=12966cd7f3b77de0
 
 http://reactjs.cn/react/docs/component-specs.html
 
 http://www.ruanyifeng.com/blog/2015/03/react.html
 
 http://purplebamboo.github.io/2015/09/15/reactjs_source_analyze_part_one/
 
 https://segmentfault.com/a/1190000004490882