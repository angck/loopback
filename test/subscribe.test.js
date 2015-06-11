describe('Subscribe', function() {
  describe('PersistedModel', function() {
    describe('configured to source changes locally', function() {
      before(function() {
        var test = this;
        var app = loopback({localRegistry: true});
        var ds = app.dataSource('ds', {connector: 'memory'});
        this.Score = app.model('Score', {
          dataSource: 'ds',
          changeDataSource: false // use only local observers
        });
      });

      it('should detect create', function(done) {
        var Score = this.Score;

        Score.subscribe(function(err, changes) {
          changes.on('data', function(change) {
            expect(change.type).to.equal('create');
            done();
          });
        });

        Score.create({team: 'foo'});
      });


      it('should detect update', function(done) {
        var Score = this.Score;
        Score.create({team: 'foo'}, function(err, newScore) {
          Score.subscribe(function(err, changes) {
            changes.on('data', function(change) {
              expect(change.type).to.equal('update');
              console.log(change);
              done();
            });
          });

          newScore.updateAttributes({
            bat: 'baz'
          });
        });
      });

      it('should detect delete', function(done) {
        var Score = this.Score;
        Score.create({team: 'foo'}, function(err, newScore) {
          Score.subscribe(function(err, changes) {
            changes.on('data', function(change) {
              expect(change.type).to.equal('delete');
              done();
            });
          });

          newScore.remove();
        });
      });
    });

    // TODO(ritch) implement multi-server support
    describe.skip('configured to source changes using pubsub', function() {
      before(function() {
        var test = this;
        var app = loopback({localRegistry: true});
        var db = app.dataSource('ds', {connector: 'memory'});
        var ps = app.dataSource('ps', {
          host: 'localhost',
          port: '12345',
          connector: 'pubsub',
          pubsubAdapter: 'mqtt'
        });
        this.Score = app.model('Score', {
          dataSource: 'db',
          changeDataSource: 'ps'
        });
      });

      it('should detect a change', function(done) {
        var Score = this.Score;

        Score.subscribe(function(err, changes) {
          changes.on('data', function(change) {
            done();
          });
        });
      });
    });
  });
});
