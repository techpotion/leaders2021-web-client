import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';


@Injectable()
export class ComponentRenderService<T> {

  private components: ComponentRef<T>[] = [];

  constructor(
    private readonly injector: Injector,
    private readonly resolver: ComponentFactoryResolver,
    private readonly application: ApplicationRef,
  ) { }

  public injectComponent(
    component: Type<T>,
    propertySetter?: (type: T) => void,
  ): HTMLElement {
    const factory = this.resolver.resolveComponentFactory(component);
    const createdComponent = factory.create(this.injector);
    this.components.push(createdComponent);

    if (propertySetter) {
      propertySetter(createdComponent.instance);
    }

    this.application.attachView(createdComponent.hostView);

    return createdComponent.location.nativeElement;
  }

  public destroyRenderedComponents(): void {
    this.components.forEach(c => c.destroy());
    this.components = [];
  }

}
