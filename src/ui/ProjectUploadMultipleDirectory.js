import React from 'react'
import { observable, toJS, computed } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import {
  Icon, Button, Row, Col, Upload, Menu, Tooltip, Input, Tree, Dropdown, message
} from 'antd'
const _ = require('lodash')
const DirectoryTree = Tree.DirectoryTree;
const { TreeNode } = Tree;

const DirectoryTitle = observer(props => (
  <span>
    {props.title + ' '}
    {
      props.uploaded ? <Icon type={'check'} /> : null
    }
  </span>
))

const NodeControls = observer(props => {
  return (
    <div style={{ marginTop: 8 }}>
      {
        props.showAdd ?
          <React.Fragment>
            <Upload
              multiple
              beforeUpload={props.beforeUpload}
              disabled={props.loading}
              type={'dashed'}
              showUploadList={false}
              style={{ cursor: 'pointer', color: '#40a9ff' }}
            >
              <Button>
                <Icon type={'file'} /> Файлы
              </Button>
            </Upload>
            {/*<Button onClick={props.onAddFolder} style={{ marginLeft: 8 }}>*/}
              {/*<Icon type="folder" /> Папка*/}
            {/*</Button>*/}
          </React.Fragment> : null
      }
      {
        props.showDelete ?
          <Button onClick={props.onRemove} style={{ marginLeft: 8 }}>
            <Icon type={'delete'} /> Удалить
          </Button> : null
      }
    </div>
  )
})

const MAIN_FOLDER = 'MAINSTRUCTUREFILEFSBHJFSDFBHJDSFSBDFHSDJHFSBFHSDBFHJSDBFHJSDFBSHFJSDFHSDJFSD'


@inject('app', 'auth', 'project')
@observer
export default class ProjectUploadMultipleDirectory extends React.Component {

  @observable fileStructure = {}
  @observable directoryName = ''
  @observable uploadedDirectories = []
  @observable uploadedRootDirectoryFiles = false
  directorySplitToken = '#$%'
  @observable selectedNode = ''
  @observable rootDirectoryFiles = []
  @observable allUploaded = false

  @computed get hasIndexHtml() {
    if (!_.isEmpty(this.fileStructure)) return true
    return Boolean(this.rootDirectoryFiles.includes('index.html'))
  }
  @computed get isAddDirectoryButtonDisabled() {
    return !this.directoryName.length || this.fileStructure.hasOwnProperty(this.directoryName)
  }

  @computed get hasEmptyDirectories() {
    return !_.isEmpty(this.fileStructure) && _.some(this.fileStructure, dir => !dir.length)
  }

  @computed get isDirectory() {
    return Boolean(this.selectedNode) && Boolean(this.fileStructure.hasOwnProperty(this.selectedNode))
  }

  @computed get isEmptyStructure() {
    return _.isEmpty(this.fileStructure)
  }
  @computed get isRootDirectorySelected() {
    return Boolean(this.selectedNode === MAIN_FOLDER)
  }

  addDirectory = () => {
    if (this.isAddDirectoryButtonDisabled) return
    this.fileStructure[this.directoryName] = []
    this.directoryName = ''
  }

  parseFileDirectoryParent(fileName) {
    const path = fileName.split(this.directorySplitToken)
    console.log(`Parsed path`, path)
    if (path.length === 1) return path
    return _.last(path)
  }

  onSelect = (key, data) => {
    if (!key[0] || this.selectedNode === key[0]) return
    this.selectedNode = key[0]
    console.log(`NODE`, data)
    console.log(`is directory?`, data.node.isLeaf())
    console.log(`children`, data.node.getNodeState())
  }

  canAddFile(file) {
    if (this.isRootDirectorySelected) {
      return !Boolean(this.rootDirectoryFiles.map(f => f.name).includes(file.name))
    }
    return !this.fileStructure[this.selectedNode].map(f => f.name).includes(file.name)
  }

  onAddFile = file => {
    if (!this.canAddFile(file)) return message.error(`Файл ${file.name} уже существует`)
    if (this.isRootDirectorySelected) {
      this.rootDirectoryFiles.push(file)
      return false
    }
    this.fileStructure[this.selectedNode].push(file)
    console.log(`File`, file)
    return false
  }

  uploadAll = () => {
    const project = this.props.project
    _.forEach(this.fileStructure, (files, directory) => {
      project.uploadBundlePart(
        files,
        project.currentProject.id,
        directory,
        () => {
          this.uploadedDirectories.push(directory)
          if (!this.rootDirectoryFiles.length || this.uploadedRootDirectoryFiles) {
            this.allUploaded = true
          }
        }
      )
    })
    console.log(`Uploaded root directory files??`, this.rootDirectoryFiles)
    if (this.rootDirectoryFiles.length) {
      project.uploadBundle(
        this.rootDirectoryFiles,
        project.currentProject.id,
        () => {
          this.uploadedRootDirectoryFiles = true
          if (this.uploadedDirectories.length === Object.keys(this.fileStructure).length) {
            this.allUploaded = true
          }
        },
        `Файлы из корневой директории загружены успешно`
      )
    }
  }

  onRemove = () => {
    if (this.isDirectory) {
      console.log(`Delete directory ${this.selectedNode}`)
      delete this.fileStructure[this.selectedNode]
      this.selectedNode = ''
      return
    }
    const rootDirectoryFileNames = this.rootDirectoryFiles.map(f => f.name)
    if (rootDirectoryFileNames.includes(this.selectedNode)) {
      const index = rootDirectoryFileNames.indexOf(this.selectedNode)
      if (this.rootDirectoryFiles[index].name === this.selectedNode) {
        this.rootDirectoryFiles.splice(index, 1)
        this.selectedNode = MAIN_FOLDER
        console.log(`Selected node became`, this.selectedNode)
      }
      return
    }
    const fileName = this.parseFileDirectoryParent(this.selectedNode)
    console.log(`Could delete file ${fileName}`)
    let parentDir = ''
    let fileIndex = -1
    _.forEach(this.fileStructure, (files, directory) => {
      const fileNameList = files.map(f => f.name)
      console.log(`Searching for ${fileName} in ${directory}`, fileNameList)
      if (fileNameList.includes(fileName)) {
        console.log(`Directory`, directory)
        parentDir = directory
        fileIndex = fileNameList.indexOf(fileName)
      }
    })
    if (parentDir && fileIndex >= 0) {
      this.fileStructure[parentDir].splice(fileIndex, 1)
    } else {
      console.log(`Had to delete file but did not found a thing: ${fileName} in parent dir ${parentDir}`, toJS(this.fileStructure[parentDir]))
    }
    this.selectedNode = ''
  }

  render() {
    const { project, app } = this.props
    const proj = project.currentProject
    return <div style={{ background: '#fff', minHeight: 460 }}>
      <p>Залей свой собранный проект сюда, чтобы Чоко собрала все и выложила на <a href={`http://${proj.id}-${proj.name}.kokoro.codes`} style={{ fontWeight: 'bold' }} target={'_blank'}>{proj.id}-{proj.name}.kokoro.codes!</a></p>
      { this.hasEmptyDirectories && <p style={{ color: 'red' }}>Папки не могут быть пустыми, удалите их или добавьте файлы</p> }
      <Row>
        <Col xs={12} sm={6}>
          <Input value={this.directoryName} onChange={e => this.directoryName = e.target.value} />
        </Col>
        <Col xs={12} sm={4}>
          <Button
            disabled={this.isAddDirectoryButtonDisabled}
            onClick={this.addDirectory}
            style={{ marginLeft: 8 }}
          >
            Добавить папку
          </Button>
        </Col>
        {
          this.selectedNode ?
            <Col xs={24}>
              <NodeControls
                showAdd={this.isDirectory || this.selectedNode === MAIN_FOLDER}
                showDelete={this.selectedNode !== MAIN_FOLDER}
                beforeUpload={this.onAddFile}
                loading={project.loading}
                onRemove={this.onRemove}
              />
            </Col> : null
        }
      </Row>
      <Row>
        <DirectoryTree
          selectedKeys={[this.selectedNode]}
          defaultExpandAll
          expandAction={'doubleClick'}
          onSelect={this.onSelect}
        >
          <TreeNode
            disabled={project.loading}
            title={proj.name}
            key={MAIN_FOLDER}
          >
            {
              _.map(this.fileStructure, (files, directory) => {
                return <TreeNode
                  disabled={project.loading}
                  title={<DirectoryTitle title={directory} uploaded={this.uploadedDirectories.includes(directory)} />}
                  key={directory}
                >
                  {
                    files.map((f, i) => (
                      <TreeNode title={<DirectoryTitle title={f.name} uploaded={this.uploadedDirectories.includes(directory)} />} key={`${directory}${this.directorySplitToken}${f.name}`} isLeaf disabled={project.loading} />
                    ))
                  }
                </TreeNode>
              })
            }
            {
              this.rootDirectoryFiles.map(f => (
                <TreeNode title={<DirectoryTitle title={f.name} uploaded={this.uploadedRootDirectoryFiles} />} key={f.name} isLeaf disabled={project.loading} />
              ))
            }
          </TreeNode>
        </DirectoryTree>
        <Col xs={12}>
          <Button
            disabled={_.isEmpty(this.fileStructure) || this.hasEmptyDirectories || project.loading || this.allUploaded}
            onClick={this.uploadAll}
          >
            Загрузить
          </Button>
        </Col>
      </Row>
    </div>
  }
}