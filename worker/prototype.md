
  - check if status of first is 'in progress', if not =>
  - set job 'in progress' (every change is ignored if in progress)
  - check type
  - => if lowres
    - get project-url
    - probe(project)
    - update project-data
    - makelowres(url)
      
  - => if renderfinal
    - ffmpeg it


  - delete job => triggers function again


```å
refProcess.limitToFirst(1).on('value', (snapshot) => {
  const jobs = snapshot.val(); 
```

```
function updateClipp(project:any){
  return new Promise((resolve, reject) => {

      var clipRef = db.ref(`projects/${project.id}/clip`);
      setTimeout(()=>{
        //console.log('project.clip =>', project.clip);
        clipRef.update(project.clip);

        //console.log(project)
        resolve(project);
      }, 10000)

  });
}
```

