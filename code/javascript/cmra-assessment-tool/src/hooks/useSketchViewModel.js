import { useRef, useEffect, useState } from 'react';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

export function useSketchViewModel(view, options = {}) {
    // hold on to the sketchViewModel in state
    const [sketchViewModel, setSketchViewModel] = useState(null);
    // use a ref so we can use initial values in a componentDidMount-like effect
    // otherwise we'd get a lint error, or have to make it a dependency of the effect
    // see: https://github.com/facebook/react/issues/15865#issuecomment-540715333
    const initialArguments = useRef({ view, options });

    // use a side effect to create the SketchViewModel after react has rendered the DOM
    useEffect(() => {
        // define local variables to be used in the clean up function
        let cancelled = false;
        let _sketchViewModel;
        async function load() {
            const { view, options } = initialArguments.current;
            if (cancelled) {
                return;
            }
            if (!options || !options.layer) {
                options.layer = new GraphicsLayer();
            }
            _sketchViewModel = new SketchViewModel({ view, ...options });
            setSketchViewModel(_sketchViewModel);
        }
        load();
        return function cleanUp() {
            // cancel any pending attempts to load the SketchViewModel
            // see: https://juliangaramendy.dev/use-promise-subscription/
            cancelled = true;
            // clean up the map SketchViewModel
            _sketchViewModel.destroy();
        };
    }, []); // similar to componentDidMount(), componentWillUnmount()

    // return the ref and the SketchViewModel
    return [sketchViewModel];
}
