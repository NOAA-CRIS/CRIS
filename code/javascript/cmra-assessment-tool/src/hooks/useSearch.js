import { useRef, useEffect, useState } from 'react';
import Search from '@arcgis/core/widgets/Search';

export function useSearch(view, options = {}) {
    // create a ref to element to be used as the map's container
    const elRef = useRef(null);
    // hold on to the search in state
    const [search, setSearch] = useState(null);
    // use a ref so we can use initial values in a componentDidMount-like effect
    // otherwise we'd get a lint error, or have to make it a dependency of the effect
    // see: https://github.com/facebook/react/issues/15865#issuecomment-540715333
    const initialArguments = useRef({ view, options });

    // use a side effect to create the view after react has rendered the DOM
    useEffect(() => {
        // define local variables to be used in the clean up function
        let cancelled = false;
        let _search;
        async function load() {
            const { view, options } = initialArguments.current;
            if (cancelled) {
                return;
            }
            _search = new Search({ view, ...options });
            await _search.when();
            // show the view at the element & add it to the state
            _search.container = elRef.current;
            setSearch(_search);
        }
        load();
        return function cleanUp() {
            // cancel any pending attempts to load the view
            // see: https://juliangaramendy.dev/use-promise-subscription/
            cancelled = true;
            // clean up the map view
            _search.destroy();
        };
    }, []); // similar to componentDidMount(), componentWillUnmount()

    // return the ref and the view
    return [elRef, search];
}
