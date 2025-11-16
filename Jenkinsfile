pipeline {
  agent any
  options {
    timestamps()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

   stage('Semgrep Static Analysis') {
    steps {
        sh '''
        echo "Running Semgrep..."
        docker run --rm \
          -v $WORKSPACE:/src \
          -w /src semgrep/semgrep \
          semgrep scan --config semgrep_rules.yaml .
        '''
        }
    }

    stage('Snyk Dependency Scan') {
      steps {
        withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
          sh '''
            echo "Running Snyk scan..."
            docker run --rm \
              -e SNYK_TOKEN=$SNYK_TOKEN \
              -v $WORKSPACE/backend:/project \
              snyk/snyk:python test --file=/project/requirements.txt || true
          '''
        }
      }
    }

  }
}
