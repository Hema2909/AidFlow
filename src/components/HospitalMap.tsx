import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Point={id:string;name:string;lat:number;lng:number;address?:string;distance?:number}
type Ambulance={id:string;name:string;lat:number;lng:number;status?:string}
const hospitalIcon=L.divIcon({className:'aidflow-hospital-marker',html:'<span>✚</span>',iconSize:[30,36],iconAnchor:[15,34],popupAnchor:[0,-32]})
const userIcon=L.divIcon({className:'aidflow-user-marker',html:'<span>●</span>',iconSize:[22,22],iconAnchor:[11,11]})
const ambulanceIcon=L.divIcon({className:'aidflow-ambulance-marker',html:'<span>🚑</span>',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-16]})
function Recenter({center}:{center:[number,number]}){const map=useMap();useEffect(()=>{map.setView(center,12) },[center,map]);return null}
export default function HospitalMap({points,center,userLocation,ambulances=[]}:{points:Point[];center:[number,number];userLocation:boolean;ambulances?:Ambulance[]}){return <div className="aidflow-map-wrap"><MapContainer center={center} zoom={12} scrollWheelZoom className="aidflow-map"><TileLayer attribution='Imagery &copy; Esri, Maxar, Earthstar Geographics' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"/><Recenter center={center}/>{userLocation&&<Marker position={center} icon={userIcon}><Popup>Your current location</Popup></Marker>}{points.map(p=><Marker key={p.id} position={[p.lat,p.lng]} icon={hospitalIcon}><Popup><strong>{p.name}</strong><br/>{p.distance!==undefined?`${p.distance.toFixed(1)} km away`:p.address}<br/><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}>Directions</a></Popup></Marker>)}{ambulances.map(a=><Marker key={a.id} position={[a.lat,a.lng]} icon={ambulanceIcon}><Popup><strong>{a.name}</strong><br/>{a.status||'Availability demo'}<br/><small>Illustrative fleet location, not live GPS</small></Popup></Marker>)}</MapContainer></div>}
