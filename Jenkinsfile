pipeline {
    agent any
    options {
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: "*/entregable4"]],
                    userRemoteConfigs: [[url: "https://github.com/MHC2005/senseibird.git"]],
                    extensions: [[$class: 'CloneOption', shallow: false, noTags: false]]
                ])
            }
        }

        stage('Semgrep Static Analysis') {
            steps {
                sh '''
                echo "Running Semgrep..."
                ls -lah .
                cat semgrep_rules.yaml

                docker run --rm \
                  -v $WORKSPACE:/src \
                  -w /src \
                  semgrep/semgrep \
                  semgrep scan \
                    --config=/src/semgrep_rules.yaml \
                    --no-git \
                    --no-git-ignore \
                    /src
                '''
            }
        }

    }
}
