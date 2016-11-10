export function getAnnotations(type:string, project: any){
  let annotations = project.annotations;
  let collection = {};

  Object.keys(annotations).forEach( key =>{
    let obj = annotations[key];
    if( obj.type === type) collection[key] = obj;
  });

  return collection;
}

export function hasTitles(project) {
  // check wether or not this project containes titles
  let isEmpty = false;

  if(project.hasOwnProperty("annotations")) {
    const annotations = getAnnotations('overlay', project);
    isEmpty = (Object.keys(annotations).length  !== 0 && annotations === Object);
  } 

  return !isEmpty;
}