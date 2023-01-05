
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.54.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/MenuTopic.svelte generated by Svelte v3.54.0 */

    const file$8 = "src/components/MenuTopic.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t = text(/*entry*/ ctx[0]);
    			add_location(div, file$8, 6, 2, 52);
    			attr_dev(main, "class", "svelte-53x9nk");
    			add_location(main, file$8, 5, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*entry*/ 1) set_data_dev(t, /*entry*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MenuTopic', slots, []);
    	let { entry } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (entry === undefined && !('entry' in $$props || $$self.$$.bound[$$self.$$.props['entry']])) {
    			console.warn("<MenuTopic> was created without expected prop 'entry'");
    		}
    	});

    	const writable_props = ['entry'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MenuTopic> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('entry' in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	$$self.$capture_state = () => ({ entry });

    	$$self.$inject_state = $$props => {
    		if ('entry' in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [entry];
    }

    class MenuTopic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { entry: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuTopic",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get entry() {
    		throw new Error("<MenuTopic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<MenuTopic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/DataComponent.svelte generated by Svelte v3.54.0 */

    const file$7 = "src/components/DataComponent.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t = text(/*dataName*/ ctx[0]);
    			add_location(div, file$7, 4, 2, 53);
    			attr_dev(main, "class", "svelte-u4pjps");
    			add_location(main, file$7, 3, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataName*/ 1) set_data_dev(t, /*dataName*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DataComponent', slots, []);
    	let { dataName } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (dataName === undefined && !('dataName' in $$props || $$self.$$.bound[$$self.$$.props['dataName']])) {
    			console.warn("<DataComponent> was created without expected prop 'dataName'");
    		}
    	});

    	const writable_props = ['dataName'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DataComponent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('dataName' in $$props) $$invalidate(0, dataName = $$props.dataName);
    	};

    	$$self.$capture_state = () => ({ dataName });

    	$$self.$inject_state = $$props => {
    		if ('dataName' in $$props) $$invalidate(0, dataName = $$props.dataName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dataName];
    }

    class DataComponent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { dataName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataComponent",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get dataName() {
    		throw new Error("<DataComponent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dataName(value) {
    		throw new Error("<DataComponent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/DataPane.svelte generated by Svelte v3.54.0 */
    const file$6 = "src/components/DataPane.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (19:4) {:else}
    function create_else_block(ctx) {
    	let div;
    	let datacomponent;
    	let t0;
    	let script;
    	let current;

    	datacomponent = new DataComponent({
    			props: { dataName: /*dataShow*/ ctx[1].name },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(datacomponent.$$.fragment);
    			t0 = space();
    			script = element("script");
    			script.textContent = "console.log(\"odd\");\n      ";
    			attr_dev(div, "class", "odd svelte-m85162");
    			add_location(div, file$6, 19, 6, 472);
    			add_location(script, file$6, 22, 6, 561);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(datacomponent, div, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, script, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datacomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datacomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(datacomponent);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(script);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(19:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if dataShow.id % 2 === 0}
    function create_if_block(ctx) {
    	let div;
    	let datacomponent;
    	let t0;
    	let script;
    	let current;

    	datacomponent = new DataComponent({
    			props: { dataName: /*dataShow*/ ctx[1].name },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(datacomponent.$$.fragment);
    			t0 = space();
    			script = element("script");
    			script.textContent = "console.log(\"even\");\n      ";
    			attr_dev(div, "class", "even svelte-m85162");
    			add_location(div, file$6, 13, 6, 319);
    			add_location(script, file$6, 16, 6, 409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(datacomponent, div, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, script, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datacomponent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datacomponent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(datacomponent);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(script);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:4) {#if dataShow.id % 2 === 0}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#each childArr as dataShow}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*dataShow*/ ctx[1].id % 2 === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(12:2) {#each childArr as dataShow}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let current;
    	let each_value = /*childArr*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(main, "class", "svelte-m85162");
    			add_location(main, file$6, 10, 0, 243);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*childArr*/ 1) {
    				each_value = /*childArr*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(main, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DataPane', slots, []);

    	let childArr = [
    		{ id: 1, name: "data01" },
    		{ id: 2, name: "data02" },
    		{ id: 3, name: "data03" },
    		{ id: 4, name: "data04" }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DataPane> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ DataComponent, childArr });

    	$$self.$inject_state = $$props => {
    		if ('childArr' in $$props) $$invalidate(0, childArr = $$props.childArr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [childArr];
    }

    class DataPane extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataPane",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/ShowData.svelte generated by Svelte v3.54.0 */

    const { console: console_1$2 } = globals;
    const file$5 = "src/components/ShowData.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let div;
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			button = element("button");
    			t = text(/*entry*/ ctx[0]);
    			attr_dev(button, "type", "button");
    			add_location(button, file$5, 18, 4, 432);
    			attr_dev(div, "class", "navMinor svelte-x10s6l");
    			add_location(div, file$5, 17, 2, 405);
    			add_location(main, file$5, 16, 0, 396);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showDataPane*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*entry*/ 1) set_data_dev(t, /*entry*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ShowData', slots, []);
    	let { entry } = $$props;

    	function showDataPane(event) {
    		DataPane.visibility = true;

    		if (("dataToShow").className === "invisible") {
    			document.getElementById("dataToShow").className = "dataPane";
    		} else {
    			console.log("funktion aufgerufen, aber nicht ausgeführt");
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (entry === undefined && !('entry' in $$props || $$self.$$.bound[$$self.$$.props['entry']])) {
    			console_1$2.warn("<ShowData> was created without expected prop 'entry'");
    		}
    	});

    	const writable_props = ['entry'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<ShowData> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('entry' in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	$$self.$capture_state = () => ({ DataPane, entry, showDataPane });

    	$$self.$inject_state = $$props => {
    		if ('entry' in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [entry, showDataPane];
    }

    class ShowData extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { entry: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShowData",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get entry() {
    		throw new Error("<ShowData>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<ShowData>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Thumbnail.svelte generated by Svelte v3.54.0 */
    const file$4 = "src/components/Thumbnail.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let menutopic;
    	let current;

    	menutopic = new MenuTopic({
    			props: { entry: /*entry*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(menutopic.$$.fragment);
    			attr_dev(main, "class", "svelte-1c9vowy");
    			add_location(main, file$4, 7, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(menutopic, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menutopic_changes = {};
    			if (dirty & /*entry*/ 1) menutopic_changes.entry = /*entry*/ ctx[0];
    			menutopic.$set(menutopic_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menutopic.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menutopic.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(menutopic);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Thumbnail', slots, []);
    	let { entry } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (entry === undefined && !('entry' in $$props || $$self.$$.bound[$$self.$$.props['entry']])) {
    			console.warn("<Thumbnail> was created without expected prop 'entry'");
    		}
    	});

    	const writable_props = ['entry'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Thumbnail> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('entry' in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	$$self.$capture_state = () => ({ MenuTopic, entry });

    	$$self.$inject_state = $$props => {
    		if ('entry' in $$props) $$invalidate(0, entry = $$props.entry);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [entry];
    }

    class Thumbnail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { entry: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thumbnail",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get entry() {
    		throw new Error("<Thumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<Thumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/UsualApp.svelte generated by Svelte v3.54.0 */
    const file$3 = "src/components/UsualApp.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let div0;
    	let p0;
    	let menutopic0;
    	let t0;
    	let showdata;
    	let t1;
    	let menutopic1;
    	let t2;
    	let div1;
    	let p1;
    	let datapane;
    	let t3;
    	let div2;
    	let p2;
    	let thumbnail;
    	let current;

    	menutopic0 = new MenuTopic({
    			props: { entry: "Dateien" },
    			$$inline: true
    		});

    	showdata = new ShowData({
    			props: { entry: "Meine Bibliothek" },
    			$$inline: true
    		});

    	menutopic1 = new MenuTopic({
    			props: { entry: "Werkzeuge" },
    			$$inline: true
    		});

    	datapane = new DataPane({ $$inline: true });

    	thumbnail = new Thumbnail({
    			props: { entry: "Thumbnail" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			p0 = element("p");
    			create_component(menutopic0.$$.fragment);
    			t0 = space();
    			create_component(showdata.$$.fragment);
    			t1 = space();
    			create_component(menutopic1.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			p1 = element("p");
    			create_component(datapane.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			p2 = element("p");
    			create_component(thumbnail.$$.fragment);
    			add_location(p0, file$3, 9, 4, 247);
    			attr_dev(div0, "class", "baseMenuSide svelte-x8q29x");
    			add_location(div0, file$3, 8, 2, 216);
    			add_location(p1, file$3, 16, 4, 429);
    			attr_dev(div1, "id", "dataToShow");
    			attr_dev(div1, "class", "dataPane svelte-x8q29x");
    			add_location(div1, file$3, 15, 2, 386);
    			attr_dev(p2, "class", "thumbnail");
    			add_location(p2, file$3, 21, 4, 498);
    			attr_dev(div2, "class", "metaInfo svelte-x8q29x");
    			add_location(div2, file$3, 20, 2, 471);
    			attr_dev(main, "class", "svelte-x8q29x");
    			add_location(main, file$3, 7, 0, 207);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, p0);
    			mount_component(menutopic0, p0, null);
    			append_dev(p0, t0);
    			mount_component(showdata, p0, null);
    			append_dev(p0, t1);
    			mount_component(menutopic1, p0, null);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, p1);
    			mount_component(datapane, p1, null);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, p2);
    			mount_component(thumbnail, p2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menutopic0.$$.fragment, local);
    			transition_in(showdata.$$.fragment, local);
    			transition_in(menutopic1.$$.fragment, local);
    			transition_in(datapane.$$.fragment, local);
    			transition_in(thumbnail.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menutopic0.$$.fragment, local);
    			transition_out(showdata.$$.fragment, local);
    			transition_out(menutopic1.$$.fragment, local);
    			transition_out(datapane.$$.fragment, local);
    			transition_out(thumbnail.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(menutopic0);
    			destroy_component(showdata);
    			destroy_component(menutopic1);
    			destroy_component(datapane);
    			destroy_component(thumbnail);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UsualApp', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UsualApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MenuTopic, ShowData, DataPane, Thumbnail });
    	return [];
    }

    class UsualApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UsualApp",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/myFuncs.svelte generated by Svelte v3.54.0 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MyFuncs', slots, []);
    	const myURL = 'http://localhost:8000/v1/';

    	async function myfetch(endpoint, cmethod, cbody) {
    		await fetch(myURL + endpoint, {
    			method: cmethod,
    			headers: {
    				'Content-Type': 'application/json',
    				'Access-Control-Allow-Origin': '*',
    				'Access-Control-Allow-Credentials': 'true',
    				'Vary': 'Origin',
    				'Sec-Fetch-Mode': 'no-cors'
    			},
    			credentials: "include",
    			body: JSON.stringify(cbody)
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MyFuncs> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ myURL, myfetch });
    	return [myURL, myfetch];
    }

    class MyFuncs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { myURL: 0, myfetch: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MyFuncs",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get myURL() {
    		return this.$$.ctx[0];
    	}

    	set myURL(value) {
    		throw new Error("<MyFuncs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get myfetch() {
    		return this.$$.ctx[1];
    	}

    	set myfetch(value) {
    		throw new Error("<MyFuncs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/register.svelte generated by Svelte v3.54.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/routes/register.svelte";

    function create_fragment$2(ctx) {
    	let myfuncs_1;
    	let t0;
    	let form;
    	let h1;
    	let t2;
    	let input0;
    	let t3;
    	let input1;
    	let t4;
    	let input2;
    	let t5;
    	let input3;
    	let t6;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let myfuncs_1_props = {};
    	myfuncs_1 = new MyFuncs({ props: myfuncs_1_props, $$inline: true });
    	/*myfuncs_1_binding*/ ctx[6](myfuncs_1);

    	const block = {
    		c: function create() {
    			create_component(myfuncs_1.$$.fragment);
    			t0 = space();
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Register User";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			input2 = element("input");
    			t5 = space();
    			input3 = element("input");
    			t6 = space();
    			button = element("button");
    			button.textContent = "Registrieren";
    			add_location(h1, file$2, 54, 2, 1331);
    			attr_dev(input0, "placeholder", "firstname");
    			add_location(input0, file$2, 55, 2, 1356);
    			attr_dev(input1, "placeholder", "lastname");
    			add_location(input1, file$2, 56, 2, 1413);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "placeholder", "foo@bar.falk");
    			add_location(input2, file$2, 57, 2, 1468);
    			attr_dev(input3, "type", "password");
    			attr_dev(input3, "placeholder", "your password as hash");
    			add_location(input3, file$2, 59, 2, 1628);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$2, 60, 2, 1711);
    			attr_dev(form, "class", "get-info");
    			add_location(form, file$2, 53, 0, 1305);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(myfuncs_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, h1);
    			append_dev(form, t2);
    			append_dev(form, input0);
    			set_input_value(input0, /*firstname*/ ctx[1]);
    			append_dev(form, t3);
    			append_dev(form, input1);
    			set_input_value(input1, /*lastname*/ ctx[2]);
    			append_dev(form, t4);
    			append_dev(form, input2);
    			set_input_value(input2, /*email*/ ctx[3]);
    			append_dev(form, t5);
    			append_dev(form, input3);
    			set_input_value(input3, /*pw_hash*/ ctx[4]);
    			append_dev(form, t6);
    			append_dev(form, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[10]),
    					listen_dev(button, "click", prevent_default(/*submit*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const myfuncs_1_changes = {};
    			myfuncs_1.$set(myfuncs_1_changes);

    			if (dirty & /*firstname*/ 2 && input0.value !== /*firstname*/ ctx[1]) {
    				set_input_value(input0, /*firstname*/ ctx[1]);
    			}

    			if (dirty & /*lastname*/ 4 && input1.value !== /*lastname*/ ctx[2]) {
    				set_input_value(input1, /*lastname*/ ctx[2]);
    			}

    			if (dirty & /*email*/ 8 && input2.value !== /*email*/ ctx[3]) {
    				set_input_value(input2, /*email*/ ctx[3]);
    			}

    			if (dirty & /*pw_hash*/ 16 && input3.value !== /*pw_hash*/ ctx[4]) {
    				set_input_value(input3, /*pw_hash*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(myfuncs_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(myfuncs_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*myfuncs_1_binding*/ ctx[6](null);
    			destroy_component(myfuncs_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Register', slots, []);
    	let myfuncs;

    	/*
        async function myfetch(endpoint, cmethod, cbody) {

            await fetch('https://thunderklaud-api.web2ju.de:8080/v1/' + endpoint, {
                method: cmethod,
                headers: {'Content-Type': 'application/json'},
                credentials: "include",
                body: JSON.stringify(
                    cbody
                )
            })
        }

     */
    	let firstname = '';

    	let lastname = '';
    	let email = '';
    	let pw_hash = '';

    	const submit = async () => {
    		$$invalidate(4, pw_hash = '988119d6cca702beb1748f4eb497e316467f69580ffa125aa8bcb6fb63dce237');
    		await myfuncs.myfetch('user/registration', 'POST', { firstname, lastname, email, pw_hash });

    		/*
            fetch('https://localhost:8000/v1/user/registration', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: "include",
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    pw_hash,
                })
            })

     */
    		console.log(firstname, lastname, email, pw_hash);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Register> was created with unknown prop '${key}'`);
    	});

    	function myfuncs_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			myfuncs = $$value;
    			$$invalidate(0, myfuncs);
    		});
    	}

    	function input0_input_handler() {
    		firstname = this.value;
    		$$invalidate(1, firstname);
    	}

    	function input1_input_handler() {
    		lastname = this.value;
    		$$invalidate(2, lastname);
    	}

    	function input2_input_handler() {
    		email = this.value;
    		$$invalidate(3, email);
    	}

    	function input3_input_handler() {
    		pw_hash = this.value;
    		$$invalidate(4, pw_hash);
    	}

    	$$self.$capture_state = () => ({
    		MyFuncs,
    		prevent_default,
    		myfuncs,
    		firstname,
    		lastname,
    		email,
    		pw_hash,
    		submit
    	});

    	$$self.$inject_state = $$props => {
    		if ('myfuncs' in $$props) $$invalidate(0, myfuncs = $$props.myfuncs);
    		if ('firstname' in $$props) $$invalidate(1, firstname = $$props.firstname);
    		if ('lastname' in $$props) $$invalidate(2, lastname = $$props.lastname);
    		if ('email' in $$props) $$invalidate(3, email = $$props.email);
    		if ('pw_hash' in $$props) $$invalidate(4, pw_hash = $$props.pw_hash);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		myfuncs,
    		firstname,
    		lastname,
    		email,
    		pw_hash,
    		submit,
    		myfuncs_1_binding,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class Register extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Register",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/routes/login.svelte generated by Svelte v3.54.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/routes/login.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Login";
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "Email");
    			add_location(input0, file$1, 15, 2, 233);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Passwort");
    			add_location(input1, file$1, 16, 2, 295);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 17, 2, 365);
    			attr_dev(main, "class", "get-info");
    			add_location(main, file$1, 13, 0, 206);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input0);
    			set_input_value(input0, /*email*/ ctx[0]);
    			append_dev(main, t0);
    			append_dev(main, input1);
    			set_input_value(input1, /*pw_hash*/ ctx[1]);
    			append_dev(main, t1);
    			append_dev(main, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(button, "click", /*submit*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*email*/ 1 && input0.value !== /*email*/ ctx[0]) {
    				set_input_value(input0, /*email*/ ctx[0]);
    			}

    			if (dirty & /*pw_hash*/ 2 && input1.value !== /*pw_hash*/ ctx[1]) {
    				set_input_value(input1, /*pw_hash*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let email = '';
    	let pw_hash = '';

    	const submit = () => {
    		fetch('');
    		console.log(email, pw_hash);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	function input1_input_handler() {
    		pw_hash = this.value;
    		$$invalidate(1, pw_hash);
    	}

    	$$self.$capture_state = () => ({ MyFuncs, email, pw_hash, submit });

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('pw_hash' in $$props) $$invalidate(1, pw_hash = $$props.pw_hash);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, pw_hash, submit, input0_input_handler, input1_input_handler];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.54.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let register;
    	let t1;
    	let footer;
    	let p;
    	let current;
    	register = new Register({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			create_component(register.$$.fragment);
    			t1 = space();
    			footer = element("footer");
    			p = element("p");
    			p.textContent = "put stuff as Components here";
    			attr_dev(img, "id", "logo");
    			if (!src_url_equal(img.src, img_src_value = "assets/Logo-V2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "XD");
    			attr_dev(img, "class", "svelte-1dxjp4j");
    			add_location(img, file, 12, 6, 232);
    			add_location(div0, file, 11, 4, 220);
    			attr_dev(header, "class", "svelte-1dxjp4j");
    			add_location(header, file, 10, 2, 207);
    			attr_dev(div1, "class", "content svelte-1dxjp4j");
    			add_location(div1, file, 15, 2, 307);
    			add_location(p, file, 20, 4, 392);
    			attr_dev(footer, "class", "svelte-1dxjp4j");
    			add_location(footer, file, 19, 2, 379);
    			attr_dev(main, "class", "svelte-1dxjp4j");
    			add_location(main, file, 9, 0, 198);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, div0);
    			append_dev(div0, img);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			mount_component(register, div1, null);
    			append_dev(main, t1);
    			append_dev(main, footer);
    			append_dev(footer, p);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(register.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(register.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(register);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ UsualApp, Register, Login, name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world',
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
