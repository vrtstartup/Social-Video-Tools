export function parseTitles( project, templates ) {
  if(project.hasOwnProperty('titles')) {
    // titles exist. 
    const titles = project.titles;
    const arrKeys = Object.keys(titles);
    const arrReturn = [];

    if(arrKeys.length !== 0 && titles.constructor === Object) {
      // has proper data type
      arrKeys.forEach((key) => {
        const title = titles[key];
        const template = templates[title.templateId];

        // append some extra data so the templater bot can update status
        title.titeId = key;
        title.projectId = project.id;

        arrReturn.push(entry(title, template));
      });
    }

    return arrReturn;
  }
}

function entry( title, template ) {
  // annotate template data with title data
  for(let field in title) {
    if(title.hasOwnProperty(field)) template[field] = title[field];
  }

  return (<any>Object).assign({}, template);
}