/// <reference path="../src/try.ts" />
/// <reference path="../d.ts/mocha.d.ts" />
/// <reference path="../d.ts/chai.d.ts" />

module katana.Spec {

    describe('Try', () => {
        chai.should();
    
        it('returns Success instacne if not throws error on f', () => {
            var trier = katana.Try(() => {
                return 1;
            });
            trier.should.instanceof(katana.Success);
        });

        it('returns Failure instacne if throws error on f', () => {
            var trier = katana.Try(() => {
                (() => {
                    throw new Error('Some Error.');
                })();
                return 1;
            });
            trier.should.instanceof(katana.Failure);
        });

        describe('Success', () => {

            var success: katana.Success<string>;
            beforeEach(() => {
                success = new katana.Success('value');
            });

            it('is success', () => {
                success.isSuccess.should.be.true;
            });

            it('is not failure', () => {
                success.isFailure.should.be.false;
            });

            describe('#get', () => {
                it('returns the value', () => {
                    success.get().should.equal('value');
                });
            });

            describe('#getOrElse', () => {
                it('returns the value', () => {
                    success.getOrElse(() => 'default').should.equal('value');
                });
            });

            describe('#orElse', () => {
                it('returns this', () => {
                    success.orElse(() => new katana.Success('alternative')).get().should.equal('value');
                });
            });

            describe('#match', () => {
                it('call Success callback with the value', () => {
                    var called = false;
                    var theValue = null;
                    success.match({
                        Success: (v) => {
                            called = true;
                            theValue = v;
                        }
                    });
                    called.should.be.true;
                    theValue.should.equal('value');
                });
            });

            describe('#map', () => {
                it('returns a Success containing the result of applying func', () => {
                    var mapped = success.map(v => v + ' HELLO');
                    mapped.should.instanceof(katana.Success);
                    mapped.get().should.equal('value HELLO');
                });

                it('returns a Failure if func throws error', () => {
                    (() => {
                        success.map(v => {
                            throw new Error(v + ' Error.');
                            return 'HELLO'
                        }).get();                       
                    }).should.throw('value Error.');
                });
            });

            describe('#flatMap', () => {
                it('returns the result of applying func', () => {
                    success.flatMap((v) => new katana.Success(v + ' HELLO')).get().should.equal('value HELLO');
                });

                it('returns a Failure if func throws error', () => {
                    (() => {
                        success.flatMap(v => {
                            throw new Error(v + ' Error.');
                            return new katana.Success('');
                        }).get();
                    }).should.throw('value Error.');
                });
            });

            describe('#filter', () => {
                it('returns that if predicater returns true', () => {
                    success.filter(v => true).get().should.equal('value');
                });

                it('returns Failure if predicater returns false', () => {
                    var failure = success.filter(v => false);
                    failure.should.instanceof(katana.Failure);
                });
            });

            describe('#reject', () => {
                it('returns that if predicater returns false', () => {
                    success.reject(v => false).get().should.equal('value');
                });

                it('returns Failure if predicater returns true', () => {
                    var failure = success.reject(v => true);
                    failure.should.instanceof(katana.Failure);
                });
            });

            describe('#foreach', () => {
                it('apply func with value', () => {
                    var value: string;
                    success.foreach(v => value = v);
                    value.should.equal('value');
                });
            });
        });

        describe('Failure', () => {
            var failure: katana.Failure<string>;
            beforeEach(() => {
                failure = new katana.Failure<string>(new Error('Error.'));    
            });

            it('is not success', () => {
                failure.isSuccess.should.be.false;
            });

            it('is failure', () => {
                failure.isFailure.should.be.true;
            });

            describe('#get', () => {
                it('throws error.', () => {
                    (() => failure.get()).should.throw('Error.');
                });
            });

            describe('#getOrElse', () => {
                it('returns default value', () => {
                    failure.getOrElse(() => 'default').should.equal('default');
                });
            });

            describe('#orElse', () => {
                it('returns alternative', () => {
                    failure.orElse(() => new katana.Success('alternative')).get().should.equal('alternative');
                });
            });
            
            describe('#match', () => {
                it('call Failure callback with the error', () => {
                    var called = false;
                    var theError = null;
                    failure.match({
                        Success: (v) => {
                        },
                        Failure: (e) => {
                            called = true;
                            theError = e;
                        }
                    });
                    called.should.be.true;
                    theError.message.should.equal('Error.');
                });
            });
            
            describe('#map', () => {
                it('never do anything', () => {
                    failure.map<string>((v) => {
                        return 'HELLO';    
                    }).should.instanceof(katana.Failure);
                });
            });

            describe('#flatMap', () => {
                it('never do anything', () => {
                    failure.flatMap<string>((v) => {
                        return new katana.Success('HELLO');
                    }).should.instanceof(katana.Failure);
                });
            });

            describe('#filter', () => {
                it('never do anything', () => {
                    failure.filter(v => true).should.eql(failure);
                });
            });

            describe('#reject', () => {
                it('never do anything', () => {
                    failure.reject(v => true).should.eql(failure);
                });
            });

            describe('#foreach', () => {
                it('never do anythig', () => {
                    var counter = 0;
                    failure.foreach(v => counter++);
                    counter.should.equal(0);
                });
            });
        });
    });

}