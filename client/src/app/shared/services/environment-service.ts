import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as urljoin from 'url-join';

@Injectable({
    providedIn: 'root',
})
export class AppConfigService {
    public buildApiUrl(path: string, ...params: string[]): string {
        return urljoin(environment.apiBaseUrl, path, ...params);
    }
}
