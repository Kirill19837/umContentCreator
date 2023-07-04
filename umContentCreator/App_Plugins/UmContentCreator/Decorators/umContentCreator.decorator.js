angular.module("umbraco").decorator("umbPropertyDirective", function ($delegate) {
    if (Array.isArray($delegate) && $delegate.length > 0) {
        const component = $delegate[0];
        if (typeof component.template === "string") {
            component.template = component.template.replace(/(<div class="controls" ng-transclude>\s*<\/div>)/, "$1<um-content-creator></um-content-creator>");
        }
    }

    return $delegate;
});