import { Component, OnInit, Renderer2, ElementRef, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';

const { Geolocation, Network } = Plugins;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss']
})

export class GoogleMapsComponent implements OnInit {

  @Input() apiKey: string;

  public map: any;
  public markers: any[] = [];
  private _mapsLoaded: Boolean = false;
  private _networkHandler: any = null;

  constructor(
    private _renderer: Renderer2,
    private _element: ElementRef,
    @Inject(DOCUMENT) private _document
  ) { }

  ngOnInit() {
    this.init().then((res) => {
        console.log('Google Maps ready.');
    }, (_error) => {
        console.log( _error );
    });
  }
  //
  private init(): Promise<any> {
    //
    return new Promise((resolve, reject) => {

        this.loadSDK().then((res) => {

            this.initMap().then((_res) => {
                resolve(true);
            }, (err) => {
                reject(err);
            });

        }, (err) => {

            reject(err);

        });

    });

  }
  //
  private loadSDK(): Promise<any> {
    //
    console.log( 'Loading Google Maps SDK' );

    return new Promise((resolve, reject) => {

        if ( ! this._mapsLoaded ) {

            Network.getStatus().then((_status) => {

                if (_status.connected) {

                    this.injectSDK().then((_res) => {
                        resolve(true);
                    }, (_err) => {
                        reject(_err);
                    });

                } else {

                    if ( this._networkHandler == null) {

                        this._networkHandler = Network.addListener('networkStatusChange', (status) => {

                            if (status.connected) {

                                this._networkHandler.remove();

                                this.init().then((_res) => {
                                    console.log('Google Maps ready.');
                                }, (_err) => {
                                    console.log(_err);
                                });

                            }

                        });

                    }

                    reject('Not online');
                }

            }, (err) => {

                // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
                if (navigator.onLine) {

                    this.injectSDK().then((_res) => {
                        resolve(true);
                    }, ( _err: any) => {
                        reject(_err);
                    });

                } else {
                    reject('Not online');
                }

            });

        } else {
            reject('SDK already loaded');
        }

    });


}

private injectSDK(): Promise<any> {

    return new Promise((resolve, reject) => {

        window['mapInit'] = () => {
            this._mapsLoaded = true;
            resolve(true);
        };

        const script = this._renderer.createElement('script');
        script.id = 'googleMaps';

        if (this.apiKey) {
            script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
        } else {
            script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';
        }

        this._renderer.appendChild(this._document.body, script);

    });

}

private initMap(): Promise<any> {

    return new Promise((resolve, reject) => {

        Geolocation.getCurrentPosition().then((position) => {

            console.log(position);

            const latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            const mapOptions = {
                center: latLng,
                zoom: 15
            };
            console.log( 'ELEM::', this._element.nativeElement);
            this._element.nativeElement.style.width = '100%';
            this._element.nativeElement.style.height = '100%';
            //
            this.map = new google.maps.Map(this._element.nativeElement, mapOptions);
            resolve(true);

        }, (err) => {

            reject('Could not initialise map');

        });

    });

  }

  public addMarker(lat: number, lng: number): void {

    const latLng = new google.maps.LatLng(lat, lng);

    const marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: latLng
    });

    this.markers.push(marker);

  }

}
