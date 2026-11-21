import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const host = document.querySelector('.scene-wrap');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 8.8);
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.AmbientLight(0x9a8aff, 1.8));
const key = new THREE.PointLight(0xd4ff70, 65, 18); key.position.set(3, 3, 4); scene.add(key);
const violet = new THREE.PointLight(0x895bff, 80, 15); violet.position.set(-3, -2, 2); scene.add(violet);

const core = new THREE.Group(); scene.add(core);
const geometry = new THREE.IcosahedronGeometry(1.55, 1);
const material = new THREE.MeshPhysicalMaterial({color:0x7960c9, metalness:.78, roughness:.18, transmission:.22, thickness:1.2, clearcoat:1, emissive:0x211044, emissiveIntensity:.8, flatShading:true});
const crystal = new THREE.Mesh(geometry, material); core.add(crystal);
const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.58,1)), new THREE.LineBasicMaterial({color:0xd4ff70, transparent:true, opacity:.7}));
core.add(wire);
const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.68,1), new THREE.MeshStandardMaterial({color:0xd4ff70, emissive:0x9fcf42, emissiveIntensity:2.1, metalness:.4, roughness:.25, wireframe:true}));
core.add(inner);

const rings = [];
for(let i=0;i<3;i++){
 const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05+i*.22, .009, 8, 180), new THREE.MeshBasicMaterial({color:i===1?0x9d7bff:0xd4ff70, transparent:true, opacity:.6-i*.12}));
 ring.rotation.set(.8+i*.55,.3+i*.6,.2); core.add(ring); rings.push(ring);
}
const particlesGeo = new THREE.BufferGeometry();
const particleCount = 650, positions = new Float32Array(particleCount*3);
for(let i=0;i<particleCount;i++){const radius=2.4+Math.random()*2.4, a=Math.random()*Math.PI*2, y=(Math.random()-.5)*4.8;positions[i*3]=Math.cos(a)*radius;positions[i*3+1]=y;positions[i*3+2]=Math.sin(a)*radius;}
particlesGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const particles = new THREE.Points(particlesGeo,new THREE.PointsMaterial({color:0xb9a7ff,size:.018,transparent:true,opacity:.8}));scene.add(particles);

let pointerX=0,pointerY=0,targetX=0,targetY=0,scrollProgress=0,dragging=false,lastX=0,lastY=0;
host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();pointerX=((e.clientX-r.left)/r.width-.5)*2;pointerY=((e.clientY-r.top)/r.height-.5)*2;if(dragging){targetY+=(e.clientX-lastX)*.008;targetX+=(e.clientY-lastY)*.008;lastX=e.clientX;lastY=e.clientY;}});
host.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture(e.pointerId);});
host.addEventListener('pointerup',()=>dragging=false);
host.addEventListener('pointercancel',()=>dragging=false);
window.addEventListener('scroll',()=>{scrollProgress=Math.min(1,scrollY/(innerHeight*.9));},{passive:true});
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();targetX+=(pointerY*.22-targetX)*.035;targetY+=(pointerX*.28-targetY)*.035;core.rotation.x=targetX+Math.sin(t*.32)*.08;core.rotation.y=targetY+t*.12+scrollProgress*.85;core.rotation.z=Math.sin(t*.2)*.08;crystal.rotation.y=-t*.08;inner.rotation.x=t*.45;inner.rotation.y=-t*.62;rings.forEach((r,i)=>{r.rotation.z+=.0015*(i+1);r.rotation.x+=.0008*(i+1)});core.position.y=Math.sin(t*.7)*.08-scrollProgress*.35;core.scale.setScalar(1-scrollProgress*.12);particles.rotation.y=t*.018;particles.rotation.x=Math.sin(t*.1)*.04;camera.position.x+=(pointerX*.22-camera.position.x)*.02;camera.position.y+=(-pointerY*.18-camera.position.y)*.02;camera.lookAt(0,0,0);renderer.render(scene,camera);}
animate();

const nav=document.querySelector('#nav');document.querySelector('.menu').addEventListener('click',()=>nav.classList.toggle('open'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');reveal.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll('.domain-card,.manifesto-layout,.mission-copy,.launch').forEach(el=>reveal.observe(el));