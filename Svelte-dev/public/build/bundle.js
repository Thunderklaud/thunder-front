
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
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

    /* src/components/DataComponent.svelte generated by Svelte v3.54.0 */

    const file$5 = "src/components/DataComponent.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t = text(/*dataName*/ ctx[0]);
    			add_location(div, file$5, 4, 2, 53);
    			attr_dev(main, "class", "svelte-u4pjps");
    			add_location(main, file$5, 3, 0, 44);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { dataName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataComponent",
    			options,
    			id: create_fragment$5.name
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
    const file$4 = "src/components/DataPane.svelte";

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
    			attr_dev(div, "class", "odd svelte-6y95vk");
    			add_location(div, file$4, 19, 6, 472);
    			add_location(script, file$4, 22, 6, 561);
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
    			attr_dev(div, "class", "even svelte-6y95vk");
    			add_location(div, file$4, 13, 6, 319);
    			add_location(script, file$4, 16, 6, 409);
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

    function create_fragment$4(ctx) {
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

    			attr_dev(main, "class", "svelte-6y95vk");
    			add_location(main, file$4, 10, 0, 243);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataPane",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/MenuTopic.svelte generated by Svelte v3.54.0 */

    const file$3 = "src/components/MenuTopic.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			p = element("p");
    			t = text(/*entry*/ ctx[0]);
    			attr_dev(p, "class", "navMain svelte-1fu20bw");
    			add_location(p, file$3, 7, 4, 62);
    			add_location(div, file$3, 6, 2, 52);
    			add_location(main, file$3, 5, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, p);
    			append_dev(p, t);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { entry: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuTopic",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get entry() {
    		throw new Error("<MenuTopic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<MenuTopic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/showData.svelte generated by Svelte v3.54.0 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/showData.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(button, file$2, 18, 4, 427);
    			attr_dev(div, "class", "navMinor svelte-1oj9gq7");
    			add_location(div, file$2, 17, 2, 400);
    			add_location(main, file$2, 16, 0, 391);
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
    				dispose = listen_dev(button, "click", /*showDataPane*/ ctx[1](), false, false, false);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ShowData', slots, []);
    	let { entry } = $$props;

    	function showDataPane() {
    		DataPane.visibility = true;

    		if (("dataToShow").className === "invisible") {
    			document.getElementById("dataToShow").className = "dataPane";
    		} else {
    			console.log("funktion aufgerufen, aber nicht ausgeführt");
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (entry === undefined && !('entry' in $$props || $$self.$$.bound[$$self.$$.props['entry']])) {
    			console_1.warn("<ShowData> was created without expected prop 'entry'");
    		}
    	});

    	const writable_props = ['entry'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ShowData> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { entry: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShowData",
    			options,
    			id: create_fragment$2.name
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
    const file$1 = "src/components/Thumbnail.svelte";

    function create_fragment$1(ctx) {
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
    			attr_dev(main, "class", "navMain");
    			add_location(main, file$1, 7, 0, 92);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { entry: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thumbnail",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get entry() {
    		throw new Error("<Thumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<Thumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.54.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let p0;
    	let menutopic0;
    	let t1;
    	let showdata;
    	let t2;
    	let menutopic1;
    	let t3;
    	let div2;
    	let p1;
    	let datapane;
    	let t4;
    	let div3;
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
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			p0 = element("p");
    			create_component(menutopic0.$$.fragment);
    			t1 = space();
    			create_component(showdata.$$.fragment);
    			t2 = space();
    			create_component(menutopic1.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			p1 = element("p");
    			create_component(datapane.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			p2 = element("p");
    			create_component(thumbnail.$$.fragment);
    			attr_dev(img, "id", "logo");
    			if (!src_url_equal(img.src, img_src_value = "assets/Logo-V2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "XD");
    			attr_dev(img, "class", "svelte-wzl3a");
    			add_location(img, file, 14, 4, 361);
    			add_location(div0, file, 13, 2, 351);
    			add_location(p0, file, 17, 4, 453);
    			attr_dev(div1, "class", "baseMenuSide svelte-wzl3a");
    			add_location(div1, file, 16, 2, 422);
    			add_location(p1, file, 24, 4, 635);
    			attr_dev(div2, "id", "dataToShow");
    			attr_dev(div2, "class", "dataPane svelte-wzl3a");
    			add_location(div2, file, 23, 2, 592);
    			attr_dev(p2, "class", "thumbnail svelte-wzl3a");
    			add_location(p2, file, 29, 4, 704);
    			attr_dev(div3, "class", "metaInfo svelte-wzl3a");
    			add_location(div3, file, 28, 2, 677);
    			attr_dev(main, "class", "svelte-wzl3a");
    			add_location(main, file, 12, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, img);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(div1, p0);
    			mount_component(menutopic0, p0, null);
    			append_dev(p0, t1);
    			mount_component(showdata, p0, null);
    			append_dev(p0, t2);
    			mount_component(menutopic1, p0, null);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, p1);
    			mount_component(datapane, p1, null);
    			append_dev(main, t4);
    			append_dev(main, div3);
    			append_dev(div3, p2);
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

    	$$self.$capture_state = () => ({
    		DataPane,
    		name,
    		MenuTopic,
    		ShowData,
    		Thumbnail,
    		DataComponent
    	});

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
