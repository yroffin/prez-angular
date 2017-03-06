export class Link {
  private previous: Link;
  private next: Link;
  private uuid: string;

  constructor(private name: string, private mesh: THREE.Mesh) {
  }

  public setLinked(_previous: Link, _next: Link) {
    this.previous = _previous;
    this.next = _next;
  }

  public setUuid(_uuid: string) {
    this.uuid = _uuid;
  }

  public getMesh() {
    return this.mesh;
  }
  public getPrevious() {
    return this.previous;
  }
  public getNext() {
    return this.next;
  }
}
