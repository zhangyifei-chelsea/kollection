import type { Photo } from '@/content/photos';
import { displayPhotoLocation } from '@/lib/display-photo-location';
import { validDate } from '@/lib/photo-calendar';

export function PhotoDetails({ photo }: { photo: Photo }) {
  const location = displayPhotoLocation(photo);
  const date = validDate(photo.date) ? photo.date : undefined;
  const weekday = date ? new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)).toUpperCase() : '';
  const place = location ? `${location.city}, ${location.country}` : 'Location unavailable';
  return <aside className="photo-details" aria-label="照片拍摄信息">
    <dl className="photo-facts">
      <div className="photo-date-row"><dt className="sr-only">拍摄日期</dt><dd>{date ? <time dateTime={date}>{date.replaceAll('-', '.')} <span>({weekday})</span></time> : '拍摄日期待补充'}</dd></div>
      {photo.captureTime && <div className="photo-time-row"><dt className="sr-only">Capture time</dt><dd>{photo.captureTime}</dd></div>}
      <div className={`photo-place-row ${location ? '' : 'awaiting-curation'}`}><dt className="sr-only">拍摄地点</dt><dd><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>{place}</span></dd></div>
    </dl>
    {photo.event && <p className="photo-event-note" aria-label="Event name">{photo.event}</p>}
    <ul className="photo-detail-tags" aria-label="地点和活动类型标签">
      <li className={location ? '' : 'awaiting-curation'}><span>Location</span>{location?.city || 'Unspecified'}</li>
      <li className={photo.eventType ? '' : 'awaiting-curation'}><span>Event type</span>{photo.eventType || 'Unspecified'}</li>
      {photo.tags.map(tag => <li key={tag} className="photo-content-tag"><span>Content</span>{tag}</li>)}
    </ul>
  </aside>;
}
