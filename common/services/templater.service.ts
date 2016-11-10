export class Templater {
  private fireBase;

  constructor(fireBase:any) { 
    this.fireBase = fireBase;
  }

  parseOverlays( project, templates ) {
    if(project.hasOwnProperty('annotations')) {
      // titles exist. 
      const overlays = this.fireBase.getAnnotations('overlay', project);
      const arrKeys = Object.keys(overlays);
      const arrReturn = [];

      if(arrKeys.length !== 0 && overlays.constructor === Object) {
        // has proper data type
        arrKeys.forEach((key) => {
          const overlay = overlays[key];
          const template = templates[overlay.templateId];

          // append some extra data so the templater bot can update status
          overlay.titeId = key;
          overlay.projectId = project.id;

          arrReturn.push(this.entry(overlay, template));
        });
      }

      return arrReturn;
    }
  }

  entry( overlay, template ) {
    // annotate template data with overlay data
    for(let field in overlay) {
      if(overlay.hasOwnProperty(field)) template[field] = overlay[field];
    }

    return (<any>Object).assign({}, template);
  }
}