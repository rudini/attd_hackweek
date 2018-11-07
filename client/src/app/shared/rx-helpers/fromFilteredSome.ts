import { Option } from 'fp-ts/lib/Option';
import { Observable, Observer } from 'rxjs';

export const fromFilteredSome = () => <T>(source: Observable<Option<T>>): Observable<T> =>
    Observable.create((observer: Observer<T>) => {
        return source.subscribe({
            next(x) {
                if (x.isSome()) {
                    observer.next(x.value);
                }
            },
            error(err) {
                observer.error(err);
            },
            complete() {
                observer.complete();
            },
        });
    });
